"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchEvents } from "@/lib/api";
import { Event } from "@/types";
import { classNames, formatDateTime, getRelativeTime, getBestH2H } from "@/lib/utils";

export default function SportEventsPage() {
  const params = useParams();
  const sportKey = Array.isArray(params.sport_key)
    ? params.sport_key[0]
    : (params.sport_key as string);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // 追蹤目前的請求，切換 sport 時或離開頁面時中止
  const ctrlRef = useRef<AbortController | null>(null);

  const fetchNow = () => {
    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    setLoading(true);
    setErr(null);

    fetchEvents(sportKey, { signal: ctrl.signal })
      .then(setEvents)
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setErr(e instanceof Error ? e.message : String(e));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNow();
    return () => ctrlRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportKey]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Events — {sportKey}</h1>
          <p className="text-sm text-gray-500">Upcoming events (from latest snapshot)</p>
        </div>

        <button
          onClick={fetchNow}
          className="px-3 py-1.5 rounded-md border hover:bg-gray-50 text-sm"
        >
          Refresh
        </button>
      </header>

      {err && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : events.length === 0 ? (
        <p className="text-gray-600">No events found.</p>
      ) : (
        <EventGrid sportKey={sportKey} items={events} />
      )}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border p-4">
          <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

function EventGrid({ sportKey, items }: { sportKey: string; items: Event[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((ev) => {
        const { homeBest, awayBest, homeBookie, awayBookie } = getBestH2H(ev.bookmakers);

        return (
          <Link
            key={ev.event_id}
            href={`/events/${encodeURIComponent(ev.event_id)}`}
            // 如果你的實際路由是 /sports/[sport_key]/events/[event_id]，改成：
            // href={`/sports/${sportKey}/events/${encodeURIComponent(ev.event_id)}`}
            className="group rounded-xl border p-4 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-base font-semibold">
                  {ev.home_team ?? "Home"} <span className="text-gray-400">vs</span>{" "}
                  {ev.away_team ?? "Away"}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDateTime(ev.commence_time)} • {getRelativeTime(ev.commence_time)}
                </div>
              </div>
              {/* 不再顯示 Live 標籤／分組 */}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className={classNames("rounded-lg border p-3", "group-hover:border-blue-400")}>
                <div className="text-xs text-gray-500">Best Home</div>
                <div className="text-lg font-semibold">
                  {homeBest != null ? homeBest.toFixed(2) : "—"}
                </div>
                <div className="text-[11px] text-gray-500 truncate">{homeBookie ?? ""}</div>
              </div>
              <div className={classNames("rounded-lg border p-3", "group-hover:border-blue-400")}>
                <div className="text-xs text-gray-500">Best Away</div>
                <div className="text-lg font-semibold">
                  {awayBest != null ? awayBest.toFixed(2) : "—"}
                </div>
                <div className="text-[11px] text-gray-500 truncate">{awayBookie ?? ""}</div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
