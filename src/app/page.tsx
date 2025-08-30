"use client";

import Link from "next/link";


const SPORTS = [
  { key: "americanfootball_nfl", name: "NFL" },
  { key: "aussierules_afl", name: "AFL" },
  { key: "basketball_nba", name: "NBA"},
  { key: "baseball_mlb", name: "MLB"},
  { key: "soccer_epl", name: "Soccer (EPL)" },
  { key: "rugby_union", name: "Rugby" },
];

export default function SportsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Choose Your Sport</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {SPORTS.map((s) => {
          return (
            <Link
              key={s.key}
              href={`/sports/${s.key}`}
              className="group block p-6 rounded-2xl shadow-md border border-gray-200 hover:shadow-xl hover:border-blue-500 transition"
            >
              <div className="flex items-center space-x-3">

                <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                  {s.name}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Explore {s.name} odds
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
