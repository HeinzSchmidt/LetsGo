"use client";

import Image from "next/image";
import type { Place } from "@/data/places";
import { extractYouTubeId } from "@/lib/youtube";

type Props = {
  place: Place;
  chosen: boolean;
  voterColor: string;
  onChoose: (id: string) => void;
  onOpenVideo: (place: Place) => void;
};

export default function WalkCard({
  place,
  chosen,
  voterColor,
  onChoose,
  onOpenVideo,
}: Props) {
  const hasVideo = Boolean(place.youtubeUrl && extractYouTubeId(place.youtubeUrl));

  const openVideo = () => {
    if (hasVideo) onOpenVideo(place);
  };

  return (
    <article
      className={`flex flex-col overflow-hidden rounded-3xl bg-white shadow-lg border-4 transition-transform hover:scale-[1.02] ${
        hasVideo ? "cursor-pointer" : ""
      }`}
      style={{ borderColor: chosen ? voterColor : "transparent" }}
      onClick={hasVideo ? openVideo : undefined}
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        <Image
          src={place.image}
          alt={place.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized
        />
        <span
          className="absolute top-3 left-3 text-4xl drop-shadow-md"
          aria-hidden
        >
          {place.emoji}
        </span>
        {chosen && (
          <span
            className="absolute top-3 right-3 flex items-center justify-center w-12 h-12 rounded-full text-white text-2xl font-black shadow-md"
            style={{ backgroundColor: voterColor }}
            aria-label="Chosen"
          >
            ✓
          </span>
        )}
        {hasVideo && (
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center"
            onClick={(event) => {
              event.stopPropagation();
              onOpenVideo(place);
            }}
            aria-label={`Watch a video about ${place.name}`}
          >
            <span
              className="flex h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] items-center justify-center rounded-full border-4 border-white text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, #FF6B9D, #FF7043)",
              }}
              aria-hidden
            >
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 ml-1"
                fill="currentColor"
                aria-hidden
              >
                <path d="M8 5.14v13.72L19.5 12 8 5.14z" />
              </svg>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-3 p-4 sm:p-5">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 leading-tight">
          {place.name}
        </h2>
        <p className="text-base sm:text-lg text-slate-600 leading-snug flex-1">
          {place.blurb}
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChoose(place.id);
          }}
          className="mt-auto min-h-[52px] w-full rounded-2xl text-lg sm:text-xl font-black
                     text-white shadow-md transition-transform active:scale-95
                     flex items-center justify-center gap-2"
          style={{
            background: chosen
              ? voterColor
              : "linear-gradient(135deg, #4FC3F7, #66BB6A)",
          }}
          aria-pressed={chosen}
        >
          {chosen ? (
            <>
              <span aria-hidden>✓</span> Chosen!
            </>
          ) : (
            <>
              <span aria-hidden>👆</span> CHOOSE
            </>
          )}
        </button>
      </div>
    </article>
  );
}
