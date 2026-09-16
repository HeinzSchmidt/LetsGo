# LETS GO!

Kid-friendly family outing site for Edward’s family. Big photos, big buttons, short words to read. Built for iPad (portrait and landscape).

The first outing page is **Where we can go for a walk**. Each child gets a unique tick colour on their device and taps **CHOOSE** on the walk they want.

## Run with Docker Compose (recommended)

On the host that will serve the site:

```bash
git clone https://github.com/HeinzSchmidt/LetsGo.git
cd LetsGo
docker compose up -d --build
```

Then open **http://localhost:8860** (or `http://<server-ip>:8860`).

| Host port | Container port |
|-----------|----------------|
| **8860**  | 80             |

Useful commands:

```bash
docker compose logs -f      # watch logs
docker compose down         # stop
docker compose up -d --build  # rebuild after you add walks
```

Votes are stored in a Docker volume (`letsgo-votes`) so they survive container rebuilds.

## Run locally without Docker

You need Python 3.10+.

```bash
python3 server.py
```

Open **http://localhost:8860**. To use another port:

```bash
PORT=8080 python3 server.py
```

## How colours and votes work

- The first time a browser opens the walks page, the server sets a cookie (`letsgo_kid`) and picks a **unique tick colour** for that device.
- The same iPad / browser keeps the same colour (the cookie lasts one year).
- A different child on a different iPad gets a different colour.
- Tapping **CHOOSE** puts that child’s coloured tick on the place. Only one walk is picked at a time.
- Change of mind: tap **CHOOSE** on another place. The tick moves.
- Open iPads refresh every few seconds, so the family can see each other’s ticks on the same grid.

Clearing site cookies (or using a private window) makes a new colour, as if a new child joined.

## How to add more walks

Walks live in a data file plus a picture. No code changes needed.

1. Add a picture in `public/images/walks/` (SVG or PNG). Keep it roughly landscape so it fills the card.
2. Add an entry to `data/walks.json`:

```json
{
  "id": "canal-bridge",
  "name": "Canal Bridge",
  "words": ["canal", "bridge", "boat"],
  "image": "/images/walks/canal-bridge.svg"
}
```

3. Use a short, unique `id` (letters, numbers, hyphens).
4. Keep `name` and `words` easy for under-10s to read.
5. Rebuild and restart:

```bash
docker compose up -d --build
```

Sample walks already included: Sunny Park, River Path, Big Hill, Forest Trail, Duck Pond, Beach Walk, Castle Path, Flower Meadow.

## iPad tips

- Add to Home Screen from Safari for a full-screen app feel.
- Landscape shows more cards in a row; portrait makes each card bigger.
- Buttons are large enough for small fingers.

## Project layout

```
data/walks.json      # walk list (edit this to add places)
data/runtime/        # votes (created at run time, not in git)
public/              # pages, CSS, JS, pictures
server.py            # tiny Python server
Dockerfile
docker-compose.yml   # host 8860 → container 80
```

No accounts or secrets in v1. The cookie is only an anonymous colour identity for this family site.
