/** Cookie helpers for voter colour + chosen place ids (client-side). */

export const VOTER_COLOR_COOKIE = "letsgo_voter_color";
export const VOTES_COOKIE = "letsgo_votes";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const VOTER_PALETTE = [
  "#FF6B9D", // berry pink
  "#4FC3F7", // sky blue
  "#66BB6A", // grass green
  "#FFB347", // sunny orange
  "#AB47BC", // grape purple
  "#FF7043", // coral
  "#26A69A", // teal
  "#EC407A", // magenta
];

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function pickRandomVoterColor(): string {
  return VOTER_PALETTE[Math.floor(Math.random() * VOTER_PALETTE.length)];
}

export function getOrCreateVoterColor(): string {
  let color = getCookie(VOTER_COLOR_COOKIE);
  if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
    color = pickRandomVoterColor();
    setCookie(VOTER_COLOR_COOKIE, color);
  }
  return color;
}

export function getVotes(): string[] {
  const raw = getCookie(VOTES_COOKIE);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function setVotes(ids: string[]): void {
  setCookie(VOTES_COOKIE, JSON.stringify(ids));
}

export function toggleVote(placeId: string): string[] {
  const current = getVotes();
  const next = current.includes(placeId)
    ? current.filter((id) => id !== placeId)
    : [...current, placeId];
  setVotes(next);
  return next;
}
