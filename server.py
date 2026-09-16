#!/usr/bin/env python3
"""LETS GO! — tiny family outing server."""

from __future__ import annotations

import json
import os
import posixpath
import tempfile
import threading
import uuid
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT / "public"
WALKS_FILE = ROOT / "data" / "walks.json"
RUNTIME_DIR = ROOT / "data" / "runtime"
STATE_FILE = RUNTIME_DIR / "family.json"
COOKIE_NAME = "letsgo_kid"
COOKIE_MAX_AGE = 60 * 60 * 24 * 365

COLOURS = [
    {"id": "ruby", "name": "Ruby Red", "hex": "#E53935"},
    {"id": "orange", "name": "Sunny Orange", "hex": "#FB8C00"},
    {"id": "lemon", "name": "Lemon", "hex": "#F9A825"},
    {"id": "grass", "name": "Grass Green", "hex": "#43A047"},
    {"id": "sky", "name": "Sky Blue", "hex": "#1E88E5"},
    {"id": "grape", "name": "Grape", "hex": "#8E24AA"},
    {"id": "bubblegum", "name": "Bubblegum", "hex": "#EC407A"},
    {"id": "teal", "name": "Teal", "hex": "#00897B"},
    {"id": "navy", "name": "Navy", "hex": "#3949AB"},
    {"id": "cocoa", "name": "Cocoa", "hex": "#6D4C41"},
]

LOCK = threading.Lock()


def load_walks() -> list[dict]:
    with WALKS_FILE.open(encoding="utf-8") as fh:
        data = json.load(fh)
    return data.get("walks", [])


def empty_state() -> dict:
    return {"kids": {}}


def load_state() -> dict:
    if not STATE_FILE.exists():
        return empty_state()
    try:
        with STATE_FILE.open(encoding="utf-8") as fh:
            data = json.load(fh)
        if not isinstance(data, dict) or "kids" not in data:
            return empty_state()
        return data
    except (OSError, json.JSONDecodeError):
        return empty_state()


def save_state(state: dict) -> None:
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(state, indent=2) + "\n"
    fd, tmp_name = tempfile.mkstemp(dir=RUNTIME_DIR, prefix="family.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(payload)
        os.replace(tmp_name, STATE_FILE)
    except Exception:
        try:
            os.unlink(tmp_name)
        except OSError:
            pass
        raise


def public_kid(kid_id: str, kid: dict) -> dict:
    return {
        "id": kid_id,
        "colour": kid["colour"],
        "colourName": kid["colourName"],
        "walkId": kid.get("walkId"),
    }


def votes_from(state: dict) -> list[dict]:
    votes = []
    for kid_id, kid in state.get("kids", {}).items():
        if kid.get("walkId"):
            votes.append(public_kid(kid_id, kid))
    return votes


def colour_counts(state: dict) -> dict[str, int]:
    counts: dict[str, int] = {c["hex"]: 0 for c in COLOURS}
    for kid in state.get("kids", {}).values():
        hex_code = kid.get("colour")
        if hex_code in counts:
            counts[hex_code] += 1
    return counts


def pick_colour(state: dict) -> dict:
    counts = colour_counts(state)
    unused = [c for c in COLOURS if counts[c["hex"]] == 0]
    if unused:
        return unused[0]
    return min(COLOURS, key=lambda c: counts[c["hex"]])


def get_or_create_kid(state: dict, kid_id: str | None) -> tuple[str, dict, bool]:
    kids = state.setdefault("kids", {})
    if kid_id and kid_id in kids:
        return kid_id, kids[kid_id], False
    new_id = uuid.uuid4().hex
    colour = pick_colour(state)
    kid = {
        "colour": colour["hex"],
        "colourName": colour["name"],
        "walkId": None,
    }
    kids[new_id] = kid
    return new_id, kid, True


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        sys_stdout = __import__("sys").stdout
        sys_stdout.write("%s - %s\n" % (self.address_string(), fmt % args))
        sys_stdout.flush()

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def cookie_kid_id(self) -> str | None:
        raw = self.headers.get("Cookie", "")
        cookie = SimpleCookie()
        cookie.load(raw)
        morsel = cookie.get(COOKIE_NAME)
        if not morsel:
            return None
        value = morsel.value.strip()
        if len(value) != 32 or any(ch not in "0123456789abcdef" for ch in value):
            return None
        return value

    def send_json(self, payload: dict, status: int = 200, set_cookie: str | None = None) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if set_cookie:
            self.send_header("Set-Cookie", set_cookie)
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, status: int, message: str) -> None:
        self.send_json({"error": message}, status=status)

    def cookie_header(self, kid_id: str) -> str:
        return (
            f"{COOKIE_NAME}={kid_id}; Path=/; Max-Age={COOKIE_MAX_AGE}; "
            "HttpOnly; SameSite=Lax"
        )

    def session_payload(self, kid_id: str, kid: dict, state: dict) -> dict:
        return {"me": public_kid(kid_id, kid), "votes": votes_from(state)}

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/session":
            self.handle_session()
            return
        if path == "/api/walks":
            self.send_json({"walks": load_walks()})
            return
        if path == "/api/votes":
            self.handle_session()
            return
        if path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path == "/api/choose":
            self.handle_choose()
            return
        self.send_error_json(HTTPStatus.NOT_FOUND, "Not found")

    def read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or 0)
        if length > 4096:
            raise ValueError("Body too large")
        raw = self.rfile.read(length) if length else b"{}"
        data = json.loads(raw.decode("utf-8"))
        if not isinstance(data, dict):
            raise ValueError("Expected JSON object")
        return data

    def handle_session(self) -> None:
        with LOCK:
            state = load_state()
            kid_id, kid, created = get_or_create_kid(state, self.cookie_kid_id())
            if created:
                save_state(state)
            self.send_json(
                self.session_payload(kid_id, kid, state),
                set_cookie=self.cookie_header(kid_id),
            )

    def handle_choose(self) -> None:
        try:
            body = self.read_json_body()
        except (ValueError, json.JSONDecodeError):
            self.send_error_json(HTTPStatus.BAD_REQUEST, "Bad JSON")
            return
        walk_id = body.get("walkId")
        walks = {item["id"] for item in load_walks()}
        if walk_id not in walks:
            self.send_error_json(HTTPStatus.BAD_REQUEST, "Unknown walk")
            return
        with LOCK:
            state = load_state()
            kid_id, kid, created = get_or_create_kid(state, self.cookie_kid_id())
            kid["walkId"] = walk_id
            save_state(state)
            self.send_json(
                self.session_payload(kid_id, kid, state),
                set_cookie=self.cookie_header(kid_id),
            )

    def translate_path(self, path: str) -> str:
        parsed = urlparse(path).path
        trailing = parsed.split("?", 1)[0].split("#", 1)[0]
        trailing = posixpath.normpath(trailing).lstrip("/")
        target = (PUBLIC / trailing).resolve()
        try:
            target.relative_to(PUBLIC.resolve())
        except ValueError:
            return str(PUBLIC / "404.html")
        if target.is_dir():
            target = target / "index.html"
        if not target.exists() or not target.is_file():
            return str(PUBLIC / "404.html")
        return str(target)

    def guess_type(self, path):
        if str(path).endswith(".svg"):
            return "image/svg+xml"
        return super().guess_type(path)


def main() -> None:
    port = int(os.environ.get("PORT", "8860"))
    RUNTIME_DIR.mkdir(parents=True, exist_ok=True)
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"LETS GO! listening on http://0.0.0.0:{port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nBye!", flush=True)
        server.server_close()


if __name__ == "__main__":
    main()
