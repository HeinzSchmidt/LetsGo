/** Parse watch, youtu.be, shorts, and embed URLs into a video id. */

const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
]);

export function extractYouTubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (YOUTUBE_ID.test(trimmed)) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0]?.split("?")[0];
      return id && YOUTUBE_ID.test(id) ? id : null;
    }

    if (YOUTUBE_HOSTS.has(host)) {
      const v = parsed.searchParams.get("v");
      if (v && YOUTUBE_ID.test(v)) return v;

      const parts = parsed.pathname.split("/").filter(Boolean);
      const prefix = parts[0];
      if (
        parts.length >= 2 &&
        (prefix === "embed" || prefix === "shorts" || prefix === "v" || prefix === "live")
      ) {
        const id = parts[1];
        return YOUTUBE_ID.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function toYouTubeEmbedUrl(url: string, autoplay = true): string | null {
  const id = extractYouTubeId(url);
  if (!id) return null;

  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (autoplay) params.set("autoplay", "1");

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}
