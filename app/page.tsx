"use client";

// Display type uses "Fraunces" for the headline. Load it in your root
// layout, e.g. via next/font/google:
//   import { Fraunces } from "next/font/google";
//   const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
// Falls back to a system serif if not loaded — nothing else depends on it.

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Bus,
  CalendarDays,
  Clock3,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

const ink = "#16302B";
const paper = "#FBF8F2";
const heroTint = "#F1ECDD";
const cardBorder = "#E4DCC8";
const rust = "#B4451F";
const rustDeep = "#93380F";
const gold = "#C79A3D";
const green = "#3F6B58";
const textMuted = "#5C5546";
const textFaint = "#8A7F68";

const displayFont = {
  fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
};

const popularRoutes = [
  { from: "Kottayam", to: "Kochi" },
  { from: "Kottayam", to: "Pala" },
  { from: "Ernakulam", to: "Alappuzha" },
  { from: "Kottayam", to: "Thiruvananthapuram" },
];

export default function HomePage() {
  const router = useRouter();

  const [from, setFrom] = useState("Kottayam");
  const [to, setTo] = useState("Pala");
  const [travelDate, setTravelDate] = useState("2026-09-19");
  const [searchMessage, setSearchMessage] = useState("");

  function swapLocations() {
    setFrom(to);
    setTo(from);
    setSearchMessage("");
  }

  function applyRoute(routeFrom: string, routeTo: string) {
    setFrom(routeFrom);
    setTo(routeTo);
    setSearchMessage("");
  }

  function handleSearch() {
    if (!from.trim() || !to.trim()) {
      setSearchMessage("Please select both your starting point and destination.");
      return;
    }

    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setSearchMessage("From and To locations must be different.");
      return;
    }

    if (!travelDate) {
      setSearchMessage("Please select a travel date.");
      return;
    }

    const params = new URLSearchParams({
      from: from.trim(),
      to: to.trim(),
      date: travelDate,
    });

    router.push(`/search?${params.toString()}`);
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: paper, color: ink }}>
      {/* Header */}
      {/* <header className="border-b" style={{ borderColor: cardBorder }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: ink }}>
              <Bus className="h-4 w-4" style={{ color: paper }} />
            </div>
            <span className="text-sm font-medium">Kerala bus finder</span>
          </div>
          <span className="hidden text-sm sm:inline" style={{ color: textMuted }}>
            Timetables checked by riders, route by route
          </span>
        </div>
      </header> */}

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: heroTint }}>
        {/* Decorative route motif */}
        <svg
          className="pointer-events-none absolute right-[-40px] top-[-20px] h-64 w-64 opacity-[0.35] sm:h-80 sm:w-80"
          viewBox="0 0 300 300"
          fill="none"
        >
          <path
            d="M20 260 C 90 260, 60 160, 140 160 S 220 60, 280 40"
            stroke={gold}
            strokeWidth="2"
            strokeDasharray="1 10"
            strokeLinecap="round"
          />
          <circle cx="20" cy="260" r="5" fill={green} />
          <circle cx="140" cy="160" r="5" fill={rust} />
          <circle cx="280" cy="40" r="5" fill={gold} />
        </svg>

        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1
              className="text-3xl font-medium leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl"
              style={{ ...displayFont, color: ink }}
            >
              Catch the right bus, every time.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7" style={{ color: textMuted }}>
              Search scheduled services between towns across Kerala —
              departure times, routes and stops, kept current by the people
              who ride them.
            </p>
          </div>

          {/* Search card */}
          <div
            className="relative mx-auto mt-8 max-w-4xl overflow-hidden rounded-3xl bg-white sm:mt-10"
            style={{
              border: `1px solid ${cardBorder}`,
              boxShadow: "0 30px 60px -30px rgba(22,48,43,0.28)",
            }}
          >
            <div
              className="h-1.5 w-full"
              style={{ background: `linear-gradient(90deg, ${rust}, ${gold})` }}
            />

            <div className="p-4 sm:p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
                {/* From */}
                <div>
                  <label htmlFor="from" className="mb-2 block text-sm font-medium" style={{ color: ink }}>
                    From
                  </label>
                  <div
                    className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors focus-within:border-transparent focus-within:ring-2"
                    style={{ borderColor: cardBorder, boxShadow: "none" }}
                  >
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: green }} />
                    <input
                      id="from"
                      value={from}
                      onChange={(event) => setFrom(event.target.value)}
                      placeholder="Starting point"
                      className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                      style={{ color: ink }}
                    />
                  </div>
                </div>

                {/* Swap */}
                <button
                  type="button"
                  onClick={swapLocations}
                  aria-label="Swap locations"
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-full border bg-white text-sm font-medium shadow-sm transition-transform hover:-rotate-180 md:w-10"
                  style={{ borderColor: cardBorder, color: ink }}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span className="md:hidden">Swap locations</span>
                </button>

                {/* To */}
                <div>
                  <label htmlFor="to" className="mb-2 block text-sm font-medium" style={{ color: ink }}>
                    To
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: cardBorder }}>
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: rust }} />
                    <input
                      id="to"
                      value={to}
                      onChange={(event) => setTo(event.target.value)}
                      placeholder="Destination"
                      className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                      style={{ color: ink }}
                    />
                  </div>
                </div>
              </div>

              {/* Date + search */}
              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label htmlFor="travel-date" className="mb-2 block text-sm font-medium" style={{ color: ink }}>
                    Travel date
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5" style={{ borderColor: cardBorder }}>
                    <CalendarDays className="h-4 w-4 shrink-0" style={{ color: textFaint }} />
                    <input
                      id="travel-date"
                      type="date"
                      value={travelDate}
                      onChange={(event) => setTravelDate(event.target.value)}
                      className="w-full border-0 bg-transparent p-0 text-sm outline-none"
                      style={{ color: ink }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 md:w-auto"
                  style={{
                    background: `linear-gradient(180deg, ${rust}, ${rustDeep})`,
                    boxShadow: "0 12px 24px -10px rgba(180,69,31,0.55)",
                  }}
                >
                  <Search className="h-4 w-4" />
                  Find buses
                </button>
              </div>

              {searchMessage && (
                <div
                  className="mt-4 rounded-lg border px-4 py-3 text-sm"
                  style={{ borderColor: "#E8C4B0", backgroundColor: "#FBEEE7", color: rust }}
                >
                  {searchMessage}
                </div>
              )}
            </div>
          </div>

          {/* Popular routes */}
          <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-2">
            <span className="text-xs" style={{ color: textFaint }}>
              Popular:
            </span>
            {popularRoutes.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                type="button"
                onClick={() => applyRoute(route.from, route.to)}
                className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[#F1ECDD]"
                style={{ borderColor: cardBorder, color: ink }}
              >
                {route.from} → {route.to}
              </button>
            ))}
          </div>
        </div>

        {/* Wave transition into the next section */}
        <svg
          className="absolute bottom-[-1px] left-0 w-full"
          viewBox="0 0 1440 60"
          preserveAspectRatio="none"
          style={{ height: "48px" }}
        >
          <path d="M0,32 C360,64 1080,0 1440,32 L1440,60 L0,60 Z" fill={paper} />
        </svg>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 lg:pr-10">
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(22,48,43,0.08)" }}
            >
              <Clock3 className="h-5 w-5" style={{ color: ink }} />
            </div>
            <h2 className="text-xl font-medium" style={{ ...displayFont, color: ink }}>
              Scheduled timings, not guesswork
            </h2>
            <p className="mt-2 max-w-sm text-sm leading-6" style={{ color: textMuted }}>
              Every result comes from a published timetable, so you know when
              a bus is meant to arrive — not just that one exists on the
              route.
            </p>
          </div>

          <div className="flex flex-col gap-8 border-t pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0" style={{ borderColor: cardBorder }}>
            <div>
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(180,69,31,0.1)" }}
              >
                <Heart className="h-4 w-4" style={{ color: rust }} />
              </div>
              <h3 className="text-sm font-medium">Save your regular routes</h3>
              <p className="mt-1 text-sm leading-6" style={{ color: textMuted }}>
                Keep the buses you take often a tap away.
              </p>
            </div>
            <div>
              <div
                className="mb-3 flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(63,107,88,0.12)" }}
              >
                <Users className="h-4 w-4" style={{ color: green }} />
              </div>
              <h3 className="text-sm font-medium">Built with local riders</h3>
              <p className="mt-1 text-sm leading-6" style={{ color: textMuted }}>
                Missing or outdated timings can be submitted for review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Verification note */}
      <section className="border-t" style={{ borderColor: cardBorder }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            className="flex items-start gap-3 rounded-2xl border bg-white p-5 sm:p-6"
            style={{ borderColor: cardBorder, boxShadow: "0 20px 40px -30px rgba(22,48,43,0.2)" }}
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(63,107,88,0.12)" }}
            >
              <ShieldCheck className="h-5 w-5" style={{ color: green }} />
            </div>
            <div>
              <h2 className="text-sm font-medium">Not every timing is verified yet</h2>
              <p className="mt-1 text-sm leading-6" style={{ color: textMuted }}>
                Some entries are still community-submitted. Each one is
                checked against official schedules before it&apos;s marked
                verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: cardBorder }}>
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-xs sm:px-6 lg:px-8" style={{ color: textFaint }}>
          Kerala bus finder — built for the road, not the boardroom.
        </div>
      </footer>
    </main>
  );
}