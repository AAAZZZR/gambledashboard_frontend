"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { fetchEventDetail, fetchEventHistory } from "@/lib/api";
import type { EventDetail, MarketType, OddsHistory } from "@/types";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

function fmt(n?: number | null, digits = 2) {
  return n == null ? "—" : n.toFixed(digits);
}

export default function EventDetailPage() {
  const { event_id } = useParams();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // chart controls
  const [market, setMarket] = useState<MarketType>("h2h");
  const [hours, setHours] = useState(72);
  const [bookmakerKey, setBookmakerKey] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<OddsHistory | null>(null);

  // 讀取事件資料
  useEffect(() => {
    if (typeof event_id !== "string") return;
    setLoading(true);
    setErr(null);
    fetchEventDetail(event_id)
      .then((data) => {
        setEvent(data);
        // 預設選第一家 bookmaker 當折線圖對象
        setBookmakerKey(data.current_odds[0]?.bookmaker_key);
      })
      .catch((e) => setErr(e instanceof Error ? e.message : String(e)))
      .finally(() => setLoading(false));
  }, [event_id]);

  // 讀取歷史（單一 event × 市場 × 選定 bookmaker × 時間範圍）
  useEffect(() => {
    if (typeof event_id !== "string") return;
    fetchEventHistory(event_id, market, hours, bookmakerKey)
      .then(setHistory)
      .catch((e) => setHistory(null));
  }, [event_id, market, hours, bookmakerKey]);

  const bookmakerOptions = useMemo(
    () =>
      event?.current_odds.map((o) => ({
        key: o.bookmaker_key,
        label: o.bookmaker_title || o.bookmaker_key,
      })) || [],
    [event]
  );

  if (loading) return <div className="p-6">Loading event detail…</div>;
  if (err) return <div className="p-6 text-red-600">Error: {err}</div>;
  if (!event) return <div className="p-6">Event not found</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Home Team: {event.home_team} <span className="text-gray-400">vs</span> Away Team: {event.away_team}
        </h1>
        <p className="text-sm text-gray-500">
          Start: {new Date(event.commence_time).toLocaleString()}
        </p>
      </div>

      {/* Odds table (最新快照，各家 bookmaker) */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Bookmakers — Latest Odds</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">Bookmaker</th>
                <th className="px-3 py-2">H2H Home </th>
                <th className="px-3 py-2">H2H Away </th>
                <th className="px-3 py-2">Spread Home (price@pt) </th>
                <th className="px-3 py-2">Spread Away (price@pt) </th>
              </tr>
            </thead>
            <tbody>
              {event.current_odds.map((o, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2 font-medium">{o.bookmaker_title ?? o.bookmaker_key}</td>
                  <td className="px-3 py-2">{fmt(o.h2h?.home)}</td>
                  <td className="px-3 py-2">{fmt(o.h2h?.away)}</td>
                  <td className="px-3 py-2">
                    {fmt(o.spreads?.home?.price)}@{fmt(o.spreads?.home?.point, 1)}
                  </td>
                  <td className="px-3 py-2">
                    {fmt(o.spreads?.away?.price)}@{fmt(o.spreads?.away?.point, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Chart controls */}
      <section>
        <div className="mb-3 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Market</label>
            <select
              value={market}
              onChange={(e) => setMarket(e.target.value as MarketType)}
              className="border rounded-md px-2 py-1"
            >
              <option value="h2h">H2H (home/away price)</option>
              <option value="spreads">Spreads (home/away price)</option>
              <option value="totals">Totals (over/under price)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bookmaker</label>
            <select
              value={bookmakerKey ?? ""}
              onChange={(e) => setBookmakerKey(e.target.value || undefined)}
              className="border rounded-md px-2 py-1 min-w-48"
            >
              {bookmakerOptions.map((b) => (
                <option key={b.key} value={b.key}>{b.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Range</label>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="border rounded-md px-2 py-1"
            >
              <option value={24}>24h</option>
              <option value={48}>48h</option>
              <option value={72}>72h</option>
            </select>
          </div>
        </div>

        {/* Line Chart */}
        <div className="h-[320px] w-full rounded-xl border p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mapHistoryToSeries(history, market)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                minTickGap={24}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(v) => new Date(v).toLocaleString()}
              />
              <Legend />
              {/* 不指定顏色，交由預設配色 */}
              <Line type="monotone" dataKey="home" name={legendName(market, "home")} dot={false} />
              <Line type="monotone" dataKey="away" name={legendName(market, "away")} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* raw summary (可保留除錯用) */}
      {/* <pre className="text-xs bg-gray-50 p-3 rounded">{JSON.stringify(history, null, 2)}</pre> */}
    </div>
  );
}

function legendName(market: MarketType, side: "home" | "away") {
  if (market === "h2h") return side === "home" ? "H2H Home" : "H2H Away";
  if (market === "spreads") return side === "home" ? "Spread Home (price)" : "Spread Away (price)";
  return side === "home" ? "Totals Over (price)" : "Totals Under (price)";
}

function mapHistoryToSeries(history: OddsHistory | null, market: MarketType) {
  if (!history) return [];
  // 只取該市場需要的欄位
  return history.history.map((p) => {
    if (market === "h2h") {
      return { t: p.timestamp, home: p.values.home ?? null, away: p.values.away ?? null };
    } else if (market === "spreads") {
      return { t: p.timestamp, home: p.values.home_price ?? null, away: p.values.away_price ?? null };
    } else {
      return { t: p.timestamp, home: p.values.over_price ?? null, away: p.values.under_price ?? null };
    }
  });
}
