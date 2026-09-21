"use client";

// Display type uses "Fraunces" for the headline. Load it in your root
// layout, e.g. via next/font/google:
//   import { Fraunces } from "next/font/google";
//   const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
// Falls back to a system serif if not loaded — nothing else depends on it.

import { useEffect, useRef, useState } from "react";
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
const asphalt = "#2A2A28";

// Buy Me a Coffee's signature yellow — used only in the support section so
// that CTA reads as its own recognizable, on-brand element.
const bmcYellow = "#FFDD00";
const bmcYellowDeep = "#F0CC00";

const displayFont = {
  fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
};

const popularRoutes = [
  { from: "Kottayam", to: "Kochi" },
  { from: "Kottayam", to: "Pala" },
  { from: "Ernakulam", to: "Alappuzha" },
  { from: "Kottayam", to: "Thiruvananthapuram" },
];

// A working list of Kerala towns and cities for the From/To pickers.
// Not exhaustive, but covers every district and the routes people search most.
const KERALA_CITIES = [
  "Thiruvananthapuram", "Kollam", "Punalur", "Pathanamthitta", "Adoor",
  "Thiruvalla", "Chengannur", "Alappuzha", "Cherthala", "Kayamkulam",
  "Mavelikkara", "Kottayam", "Changanassery", "Pala", "Ettumanoor",
  "Vaikom", "Kanjirappally", "Idukki", "Thodupuzha", "Munnar",
  "Kochi", "Ernakulam", "Aluva", "Angamaly", "Perumbavoor",
  "Muvattupuzha", "Thrissur", "Guruvayur", "Chalakudy", "Kodungallur",
  "Palakkad", "Ottapalam", "Shoranur", "Chittur", "Malappuram",
  "Manjeri", "Perinthalmanna", "Tirur", "Kondotty", "Kozhikode",
  "Koyilandy", "Vadakara", "Wayanad", "Kalpetta", "Sulthan Bathery",
  "Kannur", "Thalassery", "Payyanur", "Kasaragod", "Kanhangad",
  "Varkala", "Kovalam", "Neyyattinkara", "Attingal",
];

/** Original cup-and-heart mark evoking the Buy Me a Coffee icon, drawn from
 * scratch (not the trademarked asset) so the support section is instantly
 * recognizable without reproducing anyone else's artwork. */
function CoffeeCupMark({ size = 22, color = "#111111" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 6c-2.2 2-2.2 4.2 0 6.2" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <path d="M26 6c-2.2 2-2.2 4.2 0 6.2" stroke={color} strokeWidth="2.3" strokeLinecap="round" />
      <path
        d="M9 16h24l-2.2 19.2A4.5 4.5 0 0 1 26.3 39H15.7a4.5 4.5 0 0 1-4.5-3.8L9 16z"
        fill={color}
      />
      <path
        d="M32.5 19.5h2.7a4.3 4.3 0 0 1 0 8.6h-2"
        stroke={color}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M21.3 23.6c-1.1-1.5-3.4-1.3-3.8.5-.4 1.7 1.5 3.2 3.8 5.1 2.3-1.9 4.2-3.4 3.8-5.1-.4-1.8-2.7-2-3.8-.5z"
        fill={paper}
      />
    </svg>
  );
}

/** Small maroon-and-cream bus, styled after KSRTC liveries — rides the
 * scroll-progress track in the header. */
function KsrtcBusIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="48" height="18" rx="4" fill="#7A2323" />
      <rect x="3" y="8" width="48" height="6" rx="3" fill="#F4C542" />
      <rect x="8" y="16" width="10" height="7" rx="1.5" fill={paper} />
      <rect x="21" y="16" width="10" height="7" rx="1.5" fill={paper} />
      <rect x="34" y="16" width="10" height="7" rx="1.5" fill={paper} />
      <circle cx="14" cy="28" r="4" fill="#161616" />
      <circle cx="40" cy="28" r="4" fill="#161616" />
      <rect x="51" y="14" width="4" height="10" rx="1.5" fill="#F4C542" />
    </svg>
  );
}

/** A brightly decorated bus, styled after the flower-route buses seen
 * around Kerala — drives continuously along the road band under the hero. */
function DecoratedBusIcon({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="46" cy="52" rx="42" ry="3" fill="black" opacity="0.18" />
      <rect x="4" y="14" width="80" height="30" rx="6" fill="#1F6FB2" />
      <rect x="4" y="14" width="80" height="9" rx="4" fill="#F4A11E" />
      <rect x="10" y="26" width="14" height="10" rx="2" fill={paper} />
      <rect x="28" y="26" width="14" height="10" rx="2" fill={paper} />
      <rect x="46" y="26" width="14" height="10" rx="2" fill={paper} />
      <rect x="64" y="26" width="14" height="10" rx="2" fill={paper} />
      <circle cx="22" cy="46" r="6" fill="#161616" />
      <circle cx="66" cy="46" r="6" fill="#161616" />
      <rect x="84" y="20" width="6" height="16" rx="2" fill="#F4A11E" />
    </svg>
  );
}

/** Side-profile bus (maroon KSRTC-style) used for the custom cursor, since a
 * profile view is what actually reads as "moving left/right". Faces right
 * by default; the cursor flips it with scaleX(-1) when heading left. */
function SideBusIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size * (60 / 140)} viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="112" height="30" rx="8" fill="#7A2323" />
      <rect x="10" y="14" width="112" height="10" rx="6" fill="#F4C542" />
      <rect x="20" y="26" width="12" height="10" rx="2" fill={paper} />
      <rect x="38" y="26" width="12" height="10" rx="2" fill={paper} />
      <rect x="56" y="26" width="12" height="10" rx="2" fill={paper} />
      <rect x="74" y="26" width="12" height="10" rx="2" fill={paper} />
      <rect x="92" y="26" width="16" height="10" rx="2" fill={paper} />
      <circle cx="34" cy="46" r="8" fill="#161616" />
      <circle cx="34" cy="46" r="3" fill="#8A8A8A" />
      <circle cx="98" cy="46" r="8" fill="#161616" />
      <circle cx="98" cy="46" r="3" fill="#8A8A8A" />
      <circle cx="118" cy="30" r="2.5" fill="#F4C542" />
      <rect x="4" y="36" width="6" height="5" rx="1.5" fill="#3A3A3A" />
    </svg>
  );
}

function CityField({
  id,
  label,
  value,
  onChange,
  iconColor,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  iconColor: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const query = value.trim().toLowerCase();
  const filtered = query
    ? KERALA_CITIES.filter((city) => city.toLowerCase().includes(query))
    : KERALA_CITIES;

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className="mb-2 block text-sm font-medium" style={{ color: ink }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors focus-within:border-transparent focus-within:ring-2"
        style={{ borderColor: cardBorder }}
      >
        <MapPin className="h-4 w-4 shrink-0" style={{ color: iconColor }} />
        <input
          id={id}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full border-0 bg-transparent p-0 text-sm outline-none"
          style={{ color: ink }}
        />
      </div>

      {open && (
        <div
          className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border bg-white p-1.5"
          style={{ borderColor: cardBorder, boxShadow: "0 20px 40px -20px rgba(22,48,43,0.35)" }}
        >
          {filtered.length > 0 ? (
            filtered.slice(0, 8).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  onChange(city);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-[#F1ECDD]"
                style={{ color: ink }}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: textFaint }} />
                {city}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-xs" style={{ color: textFaint }}>
              No match in the list — you can still type this place manually.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

type SmokePuff = { id: number; x: number; y: number };

export default function HomePage() {
  const router = useRouter();

  const [from, setFrom] = useState("Kottayam");
  const [to, setTo] = useState("Pala");
  const [travelDate, setTravelDate] = useState("2026-09-19");
  const [searchMessage, setSearchMessage] = useState("");

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingCoffee, setShowFloatingCoffee] = useState(false);

  // Custom bus cursor
  const [customCursorEnabled, setCustomCursorEnabled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [tilt, setTilt] = useState(0);
  const [smokePuffs, setSmokePuffs] = useState<SmokePuff[]>([]);
  const flipRef = useRef<1 | -1>(1);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const lastSpawnRef = useRef({ x: 0, y: 0 });
  const puffIdRef = useRef(0);

  useEffect(() => {
    let ticking = false;

    function updateOnScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      setShowFloatingCoffee(window.scrollY > 240);
      ticking = false;
    }

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateOnScroll);
        ticking = true;
      }
    }

    updateOnScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!finePointer || reducedMotion) {
      return;
    }

    setCustomCursorEnabled(true);

    function handleMouseMove(event: MouseEvent) {
      const { clientX, clientY } = event;
      setCursorPos({ x: clientX, y: clientY });
      setCursorVisible(true);

      const last = lastPosRef.current;
      const dx = clientX - last.x;
      lastPosRef.current = { x: clientX, y: clientY };

      if (Math.abs(dx) > 0.6) {
        flipRef.current = dx < 0 ? -1 : 1;
      }
      setTilt(Math.max(-10, Math.min(10, dx * 0.7)));

      const lastSpawn = lastSpawnRef.current;
      const distance = Math.hypot(clientX - lastSpawn.x, clientY - lastSpawn.y);

      if (distance > 18) {
        lastSpawnRef.current = { x: clientX, y: clientY };
        const offsetX = flipRef.current === 1 ? -30 : 30;
        const id = puffIdRef.current++;
        setSmokePuffs((current) => [...current, { id, x: clientX + offsetX, y: clientY + 10 }]);
        window.setTimeout(() => {
          setSmokePuffs((current) => current.filter((puff) => puff.id !== id));
        }, 650);
      }
    }

    function handleMouseLeave() {
      setCursorVisible(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

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
    <main
      className={`min-h-screen ${customCursorEnabled ? "bus-cursor-active" : ""}`}
      style={{ backgroundColor: paper, color: ink }}
    >
      <style jsx global>{`
        @keyframes driveAcross {
          0% {
            transform: translateX(-110px);
          }
          100% {
            transform: translateX(calc(100vw + 110px));
          }
        }
        @keyframes floatPulse {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        @keyframes smokePuff {
          0% {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.55;
          }
          100% {
            transform: translate(-50%, -50%) translateY(-18px) scale(1.7);
            opacity: 0;
          }
        }
        .decorated-bus-track {
          animation: driveAcross 20s linear infinite;
        }
        .floating-coffee-idle {
          animation: floatPulse 2.4s ease-in-out infinite;
        }
        .smoke-puff {
          animation: smokePuff 650ms ease-out forwards;
        }
        /* Custom bus cursor: only applied when JS confirms a fine pointer
           and no reduced-motion preference, so touch/keyboard users and
           anyone sensitive to motion keep their normal cursor. */
        .bus-cursor-active,
        .bus-cursor-active * {
          cursor: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .decorated-bus-track,
          .floating-coffee-idle,
          .smoke-puff {
            animation: none !important;
          }
        }
      `}</style>

      {/* Header with a scroll-progress "road" */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur"
        style={{ borderColor: cardBorder, backgroundColor: "rgba(251,248,242,0.9)" }}
      >
        {/* <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: ink }}>
              <Bus className="h-4 w-4" style={{ color: paper }} />
            </div>
            <span className="text-sm font-medium">Kerala bus finder</span>
          </div>
          <span className="hidden text-sm sm:inline" style={{ color: textMuted }}>
            Timetables checked by riders, route by route
          </span>
        </div> */}

        <div
          className="relative h-[4px] w-full"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${cardBorder} 0 10px, transparent 10px 18px)`,
          }}
        >
          <div
            className="absolute top-1/2"
            style={{
              left: `${scrollProgress}%`,
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
            }}
            aria-hidden
          >
            <KsrtcBusIcon size={30} />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: heroTint }}>
        {/* Soft glow behind the headline */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: `radial-gradient(closest-side, ${gold}, transparent)` }}
        />

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

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8">
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
            className="relative mx-auto mt-8 max-w-4xl overflow-visible rounded-3xl bg-white transition-shadow duration-300 hover:shadow-2xl sm:mt-10"
            style={{
              border: `1px solid ${cardBorder}`,
              boxShadow: "0 30px 60px -30px rgba(22,48,43,0.28)",
            }}
          >
            <div
              className="h-1.5 w-full rounded-t-3xl"
              style={{ background: `linear-gradient(90deg, ${rust}, ${gold})` }}
            />

            <div className="p-4 sm:p-6">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
                <CityField
                  id="from"
                  label="From"
                  value={from}
                  onChange={setFrom}
                  iconColor={green}
                  placeholder="Starting point"
                />

                {/* Swap */}
                <button
                  type="button"
                  onClick={swapLocations}
                  aria-label="Swap locations"
                  className="mt-8 flex h-10 w-full items-center justify-center gap-2 rounded-full border bg-white text-sm font-medium shadow-sm transition-transform duration-300 hover:-rotate-180 md:w-10"
                  style={{ borderColor: cardBorder, color: ink }}
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  <span className="md:hidden">Swap locations</span>
                </button>

                <CityField
                  id="to"
                  label="To"
                  value={to}
                  onChange={setTo}
                  iconColor={rust}
                  placeholder="Destination"
                />
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
                className="rounded-full border bg-white px-3 py-1.5 text-xs font-medium transition-all hover:-translate-y-0.5 hover:bg-[#F1ECDD]"
                style={{ borderColor: cardBorder, color: ink }}
              >
                {route.from} → {route.to}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* An actual road band — the decorative bus drives on this */}
      <div className="relative h-14 overflow-hidden sm:h-16" style={{ backgroundColor: asphalt }}>
        <div
          className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, ${gold} 0 22px, transparent 22px 42px)`,
          }}
        />
        <div className="decorated-bus-track pointer-events-none absolute bottom-1.5" aria-hidden>
          <DecoratedBusIcon size={68} />
        </div>
      </div>

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

      {/* Support the project */}
      <section className="border-t" style={{ borderColor: cardBorder }}>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div
            className="relative overflow-hidden rounded-3xl border"
            style={{
              borderColor: "#F0E29C",
              background: `linear-gradient(135deg, #FFF6C2 0%, ${paper} 55%)`,
              boxShadow: "0 20px 45px -28px rgba(240,204,0,0.55)",
            }}
          >
            <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.08]">
              <CoffeeCupMark size={160} color={ink} />
            </div>

            <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: bmcYellow, boxShadow: "0 8px 20px -8px rgba(240,204,0,0.7)" }}
                >
                  <CoffeeCupMark size={24} color="#111111" />
                </div>

                <h2 className="text-xl font-medium" style={{ ...displayFont, color: ink }}>
                  Support Kerala Bus Finder
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: textMuted }}>
                  Kerala Bus Finder is built to make finding bus timings
                  across Kerala easier. If you find it useful, you can
                  support the project and help us keep improving it.
                </p>
              </div>

              <a
                href="https://buymeacoffee.com/milanabraham"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 md:w-auto"
                style={{
                  backgroundColor: bmcYellow,
                  boxShadow: "0 14px 28px -10px rgba(240,204,0,0.8)",
                  border: `1px solid ${bmcYellowDeep}`,
                }}
              >
                <CoffeeCupMark size={20} color="#111111" />
                Buy me a coffee
              </a>
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

      {/* Floating "Buy me a coffee" — appears once you scroll a little, and
          stays fixed in place the whole time after that. */}
      <a
        href="https://buymeacoffee.com/milanabraham"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Buy me a coffee"
        className="floating-coffee-idle fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-black shadow-lg transition-opacity duration-300 ease-out hover:-translate-y-0.5"
        style={{
          backgroundColor: bmcYellow,
          border: `1px solid ${bmcYellowDeep}`,
          boxShadow: "0 14px 28px -10px rgba(240,204,0,0.8)",
          opacity: showFloatingCoffee ? 1 : 0,
          pointerEvents: showFloatingCoffee ? "auto" : "none",
        }}
      >
        <CoffeeCupMark size={18} color="#111111" />
        <span className="hidden sm:inline">Buy me a coffee</span>
      </a>

      {/* Custom bus cursor + trailing exhaust smoke */}
      {customCursorEnabled && (
        <>
          {smokePuffs.map((puff) => (
            <span
              key={puff.id}
              className="smoke-puff pointer-events-none fixed z-[60] rounded-full"
              style={{
                left: puff.x,
                top: puff.y,
                width: 10,
                height: 10,
                backgroundColor: "rgba(80,80,80,0.55)",
              }}
            />
          ))}

          <div
            className="pointer-events-none fixed z-[70] transition-transform duration-100 ease-out"
            style={{
              left: cursorPos.x,
              top: cursorPos.y,
              opacity: cursorVisible ? 1 : 0,
              transform: `translate(-50%, -50%) scaleX(${flipRef.current}) rotate(${tilt}deg)`,
            }}
          >
            <SideBusIcon size={58} />
          </div>
        </>
      )}
    </main>
  );
}