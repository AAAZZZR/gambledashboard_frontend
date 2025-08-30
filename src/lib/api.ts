import { Sport, Event, EventDetail, OddsHistory, MarketType } from "@/types";

const API_BASE = "http://localhost:8000"; // FastAPI 後端

// ============= SPORTS =============
export async function fetchSports(): Promise<Sport[]> {
  const res = await fetch(`${API_BASE}/api/sports`);
  if (!res.ok) throw new Error("Failed to fetch sports");
  return res.json();
}

// ============= EVENTS =============
// export async function fetchEvents(sport_key: string): Promise<Event[]> {
//   const res = await fetch(`${API_BASE}/api/sports/${sport_key}/events`);
//   if (!res.ok) throw new Error("Failed to fetch events");
//   return res.json();
// }
export async function fetchEvents(
  sport_key: string,
  opts?: { signal?: AbortSignal }
): Promise<Event[]> {
  const url = `${API_BASE}/api/sports/${sport_key}/events`;
  const res = await fetch(url, { signal: opts?.signal, cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
}

// ============= EVENT DETAIL =============
// export async function fetchEventDetail(event_id: string): Promise<EventDetail> {
//   const res = await fetch(`${API_BASE}/api/events/${event_id}`);
//   if (!res.ok) throw new Error("Failed to fetch event detail");
//   return res.json();
// }

export async function fetchEventDetail(event_id: string): Promise<EventDetail> {
  const res = await fetch(`${API_BASE}/api/events/${encodeURIComponent(event_id)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch event detail (${res.status})`);
  return res.json();
}

export async function fetchEventHistory(
  event_id: string,
  market: MarketType,
  hours = 72,
  bookmaker?: string
): Promise<OddsHistory> {
  const qs = new URLSearchParams({ market_type: market, hours: String(hours) });
  if (bookmaker) qs.set("bookmaker", bookmaker);
  const url = `${API_BASE}/api/events/${encodeURIComponent(event_id)}/history?${qs.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch history (${res.status})`);
  return res.json();
}