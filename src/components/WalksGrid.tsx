"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { places } from "@/data/places";
import {
  getOrCreateVoterColor,
  getVotes,
  toggleVote,
} from "@/lib/cookies";
import WalkCard from "./WalkCard";

export default function WalksGrid() {
  const [voterColor, setVoterColor] = useState("#FF6B9D");
  const [votes, setVotes] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setVoterColor(getOrCreateVoterColor());
    setVotes(getVotes());
    setReady(true);
  }, []);

  const handleChoose = useCallback((id: string) => {
    const next = toggleVote(id);
    setVotes(next);
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-10">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-[44px] text-lg font-bold text-slate-600 hover:text-slate-900 mb-2"
          >
            ← Home
          </Link>
          <h1
            className="text-4xl sm:text-5xl font-black"
            style={{
              background: "linear-gradient(90deg, #FF6B9D, #FFB347, #4FC3F7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Pick a Walk! 🥾
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Tap CHOOSE. Your colour is{" "}
            <span
              className="inline-block align-middle w-7 h-7 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: ready ? voterColor : "#ccc" }}
              title={voterColor}
              aria-label={`Your voter colour ${voterColor}`}
            />
          </p>
        </div>
        {ready && votes.length > 0 && (
          <p className="text-xl font-bold text-slate-700 bg-white/80 rounded-2xl px-5 py-3 shadow min-h-[44px] flex items-center">
            ✅ {votes.length} picked
          </p>
        )}
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {places.map((place) => (
          <WalkCard
            key={place.id}
            place={place}
            chosen={votes.includes(place.id)}
            voterColor={voterColor}
            onChoose={handleChoose}
          />
        ))}
      </div>
    </div>
  );
}
