"use client";

import { useEffect, useRef } from "react";
import type { Place } from "@/data/places";
import { toYouTubeEmbedUrl } from "@/lib/youtube";

type Props = {
  place: Place;
  onClose: () => void;
};

export default function VideoOverlay({ place, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const embedUrl = place.youtubeUrl
    ? toYouTubeEmbedUrl(place.youtubeUrl, true)
    : null;

  useEffect(() => {
    if (!embedUrl) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [embedUrl, onClose]);

  if (!embedUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-overlay-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"
        aria-label="Close video"
        onClick={onClose}
      />

      <div
        className="relative z-10 flex w-full max-w-5xl max-h-[100dvh] flex-col overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-2xl"
        style={{
          boxShadow:
            "0 20px 50px rgba(255, 107, 157, 0.35), 0 0 0 6px #FFB347, 0 0 0 12px #4FC3F7",
        }}
      >
        <header
          className="flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4"
          style={{
            background: "linear-gradient(90deg, #FF6B9D, #FFB347, #4FC3F7)",
          }}
        >
          <span className="text-3xl sm:text-4xl" aria-hidden>
            {place.emoji}
          </span>
          <h2
            id="video-overlay-title"
            className="flex-1 text-xl sm:text-3xl font-black text-white drop-shadow leading-tight"
          >
            {place.name}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-white text-3xl sm:text-4xl font-black text-coral shadow-lg transition-transform active:scale-90 hover:scale-105"
            aria-label="Close video"
          >
            ✕
          </button>
        </header>

        <div className="relative aspect-video w-full bg-slate-900">
          <iframe
            key={place.id}
            src={embedUrl}
            title={`${place.name} video`}
            className="absolute inset-0 h-full w-full border-0"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
