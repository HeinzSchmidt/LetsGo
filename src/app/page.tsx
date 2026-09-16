import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl text-center">
        {/* Decorative blobs */}
        <div className="relative mb-8">
          <div
            className="absolute -top-8 -left-4 w-24 h-24 rounded-full opacity-40 blur-sm"
            style={{ background: "linear-gradient(135deg, #FF6B9D, #FFB347)" }}
            aria-hidden
          />
          <div
            className="absolute -top-4 -right-2 w-20 h-20 rounded-full opacity-40 blur-sm"
            style={{ background: "linear-gradient(135deg, #4FC3F7, #66BB6A)" }}
            aria-hidden
          />

          <h1
            className="relative text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none"
            style={{
              background: "linear-gradient(90deg, #FF6B9D, #FFB347, #4FC3F7, #AB47BC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            LETS GO!
          </h1>
        </div>

        <p className="text-2xl sm:text-3xl font-bold text-slate-700 mb-4">
          🗺️ Family walks 🥾
        </p>
        <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-md mx-auto leading-relaxed">
          Pick a place. Tick your favourites. Ready for adventure!
        </p>

        <Link
          href="/walks"
          className="inline-flex items-center justify-center gap-3 min-h-[64px] min-w-[220px] px-10 py-5
                     text-2xl sm:text-3xl font-black text-white rounded-3xl shadow-lg
                     transition-transform active:scale-95 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #FF6B9D 0%, #FFB347 50%, #FF7043 100%)",
          }}
        >
          <span aria-hidden>🚶</span>
          See Walks
          <span aria-hidden>✨</span>
        </Link>
      </div>
    </main>
  );
}
