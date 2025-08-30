import { BookmakerOdds } from "@/types";

export function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function formatDateTime(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString();
}

export function getRelativeTime(iso: string | Date) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const diffMs = d.getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin > 60) return `in ${Math.round(diffMin / 60)}h`;
  if (diffMin > 1) return `in ${diffMin}m`;
  if (diffMin >= -1 && diffMin <= 1) return "now";
  if (diffMin >= -60) return `${Math.abs(diffMin)}m ago`;
  return `${Math.round(Math.abs(diffMin) / 60)}h ago`;
}

export function getBestH2H(bookmakers: BookmakerOdds[]) {
  let homeBest: number | null = null;
  let awayBest: number | null = null;
  let homeBookie: string | null = null;
  let awayBookie: string | null = null;

  for (const bm of bookmakers) {
    const h = bm.h2h?.home ?? null;
    const a = bm.h2h?.away ?? null;
    if (h != null && (homeBest == null || h > homeBest)) {
      homeBest = h;
      homeBookie = bm.bookmaker_title || bm.bookmaker_key;
    }
    if (a != null && (awayBest == null || a > awayBest)) {
      awayBest = a;
      awayBookie = bm.bookmaker_title || bm.bookmaker_key;
    }
  }
  return { homeBest, awayBest, homeBookie, awayBookie };
}
