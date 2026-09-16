# LETS GO! 🥾

A colourful, iPad-first family travel web app for picking walks together. Big touch targets, bright cards, short kid-friendly text.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Node 20
- Client-side cookie voting (unique colour per browser)

## Cookie design

| Cookie | Purpose | Example |
|--------|---------|---------|
| `letsgo_voter_color` | Unique hex colour for this browser’s ticks | `#FF6B9D` |
| `letsgo_votes` | JSON array of chosen place ids | `["sunny-park","duck-lake"]` |

Both cookies are set client-side with `path=/`, `SameSite=Lax`, and a 1-year `max-age`.  
On first visit the app picks a random colour from a bright palette and stores it in `letsgo_voter_color`. Tapping **CHOOSE** toggles a place id in `letsgo_votes` and shows a tick in that voter’s colour.

Helpers live in `src/lib/cookies.ts`.

## Local run (dev)

```bash
cd /workspace/LetsGo   # or wherever you cloned it
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build locally:

```bash
npm run build
npm start
```

## Docker Compose deploy

Maps host **8866** → container **3000**, restart policy `unless-stopped`.

```bash
docker compose up -d --build
```

Then open [http://localhost:8866](http://localhost:8866).

Stop:

```bash
docker compose down
```

Validate compose file:

```bash
docker compose config
```

## How to add places

Edit **`src/data/places.ts`**. Each place needs:

```ts
{
  id: "my-new-walk",          // unique string (stored in letsgo_votes)
  name: "My New Walk",
  blurb: "Short under-10 text!",
  image: "/walks/my-image.svg", // file under public/
  emoji: "🌟",
  youtubeUrl: "https://www.youtube.com/watch?v=...", // optional
}
```

`youtubeUrl` is optional. Watch URLs, `youtu.be` links, and embed URLs all work. Places with a URL show a play badge; tapping the card (image / title / blurb) opens a full-screen YouTube overlay. **CHOOSE** does not open the video — it only toggles the vote. Cards without a URL behave as before.

1. Drop a photo or SVG into `public/walks/`.
2. Add an entry to the `places` array in `src/data/places.ts`.
3. Rebuild (`npm run build` or `docker compose up -d --build`).

You can also keep a mirror list in `places.json` if you prefer JSON — the app currently imports TypeScript from `src/data/places.ts`.

## Pages

- `/` — Home: big **LETS GO!** title, kid tagline, button to walks
- `/walks` — Grid of places with photo, name, **CHOOSE** toggle, and optional YouTube overlay

## Design notes

- Touch targets ≥ 44px (buttons often 52–64px)
- Rounded cards, gradients, bright primary colours
- Favours images/icons; blurbs stay short for under-10 reading practice
