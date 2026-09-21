"use client";

// Display type uses "Fraunces" for headlines. Load it in your root layout:
//   import { Fraunces } from "next/font/google";
//   const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
// Falls back to a system serif if not loaded — nothing else depends on it.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
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

/* ------------------------------------------------------------------ */
/* Tokens                                                              */
/* ------------------------------------------------------------------ */

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

const telegramBlue = "#229ED9";

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

/** Local (not UTC) YYYY-MM-DD, so the default date matches the rider's day. */
function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/* ------------------------------------------------------------------ */
/* Artwork                                                             */
/* ------------------------------------------------------------------ */

/** Original cup-and-heart mark evoking the Buy Me a Coffee icon, drawn from
 * scratch (not the trademarked asset) so the support section is instantly
 * recognizable without reproducing anyone else's artwork. */
function CoffeeCupMark({ size = 22, color = "#111111" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

function TelegramGlyph({ size = 24, color = "#FFFFFF" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.5 3.5 18.1 20c-.3 1.2-1 1.5-2 1l-4.7-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.4-4.8 8.7-7.9c.4-.4-.1-.6-.6-.2L5.8 14.2l-4.6-1.5c-1-.3-1-1 .2-1.5L19.5 4c.9-.3 2.2-.5 2 1.5Z"
        fill={color}
      />
    </svg>
  );
}

/** Small maroon-and-cream bus, styled after KSRTC liveries — rides the
 * scroll-progress track in the header. */
function KsrtcBusIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
    <svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
    <svg width={size} height={size * (60 / 140)} viewBox="0 0 140 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

/* ------------------------------------------------------------------ */
/* City picker                                                         */
/* ------------------------------------------------------------------ */

function CityField({
  id,
  label,
  value,
  onChange,
  onSubmit,
  iconColor,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  iconColor: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  const options = useMemo(() => {
    const query = value.trim().toLowerCase();
    const matches = query
      ? KERALA_CITIES.filter((city) => city.toLowerCase().includes(query)).sort((a, b) => {
          // Places that start with what you typed come first.
          const aStarts = a.toLowerCase().startsWith(query) ? 0 : 1;
          const bStarts = b.toLowerCase().startsWith(query) ? 0 : 1;
          return aStarts - bStarts;
        })
      : KERALA_CITIES;
    return matches.slice(0, 8);
  }, [value]);

  // Keep the highlighted row in view when moving with the keyboard.
  useEffect(() => {
    if (!open || activeIndex < 0 || !listRef.current) return;
    const node = listRef.current.children[activeIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function select(city: string) {
    onChange(city);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setActiveIndex(0);
        return;
      }
      setActiveIndex((index) => (index + 1) % Math.max(options.length, 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) return;
      setActiveIndex((index) => (index <= 0 ? options.length - 1 : index - 1));
      return;
    }
    if (event.key === "Enter") {
      if (open && activeIndex >= 0 && options[activeIndex]) {
        event.preventDefault();
        select(options[activeIndex]);
        return;
      }
      setOpen(false);
      onSubmit?.();
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label htmlFor={id} className="mb-2 block text-sm font-medium" style={{ color: ink }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 rounded-2xl border bg-white px-3.5 py-3 transition-shadow focus-within:border-[#C7B98F] focus-within:shadow-[0_0_0_3px_rgba(199,154,61,0.22)]"
        style={{ borderColor: cardBorder }}
      >
        <MapPin className="h-4 w-4 shrink-0" style={{ color: iconColor }} />
        <input
          id={id}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-autocomplete="list"
          aria-activedescendant={
            open && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          className="w-full border-0 bg-transparent p-0 text-[15px] outline-none placeholder:text-[#B0A68C]"
          style={{ color: ink }}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(true);
              setActiveIndex(-1);
            }}
            aria-label={`Clear ${label.toLowerCase()}`}
            className="rounded-full px-1.5 text-lg leading-none transition-colors hover:bg-[#F1ECDD]"
            style={{ color: textFaint }}
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <div
          id={`${id}-listbox`}
          role="listbox"
          ref={listRef}
          className="absolute z-30 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border bg-white p-1.5"
          style={{ borderColor: cardBorder, boxShadow: "0 24px 48px -24px rgba(22,48,43,0.4)" }}
        >
          {options.length > 0 ? (
            options.map((city, index) => (
              <button
                key={city}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={city === value}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(city)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors"
                style={{
                  color: ink,
                  backgroundColor: index === activeIndex ? heroTint : "transparent",
                }}
              >
                <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: textFaint }} />
                {city}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-xs leading-5" style={{ color: textFaint }}>
              No match in the list. You can still type this place yourself and search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const router = useRouter();

  const [from, setFrom] = useState("Kottayam");
  const [to, setTo] = useState("Pala");
  const [travelDate, setTravelDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [swapSpin, setSwapSpin] = useState(0);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showFloatingActions, setShowFloatingActions] = useState(false);

  // Custom bus cursor — positioned imperatively so mouse movement never
  // triggers a React re-render.
  const [customCursorEnabled, setCustomCursorEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const smokeRef = useRef<HTMLDivElement>(null);

  // Today's date is resolved on the client so the server and client markup
  // match on first paint.
  useEffect(() => {
    const today = todayISO();
    setMinDate(today);
    setTravelDate((current) => current || today);
  }, []);

  useEffect(() => {
    let ticking = false;

    function updateOnScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setScrollProgress(clamp(progress, 0, 100));
      setShowFloatingActions(window.scrollY > 320);
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
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Enable the bus cursor only for a fine pointer with motion allowed, and
  // keep listening in case the preference changes mid-session.
  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    function evaluate() {
      setCustomCursorEnabled(pointerQuery.matches && !motionQuery.matches);
    }

    evaluate();
    pointerQuery.addEventListener("change", evaluate);
    motionQuery.addEventListener("change", evaluate);
    return () => {
      pointerQuery.removeEventListener("change", evaluate);
      motionQuery.removeEventListener("change", evaluate);
    };
  }, []);

  useEffect(() => {
    if (!customCursorEnabled) return;
    const bus = cursorRef.current;
    const smokeLayer = smokeRef.current;
    if (!bus || !smokeLayer) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let x = 0;
    let y = 0;
    let flip: 1 | -1 = 1;
    let tilt = 0;
    let started = false;
    let lastSpawnX = 0;
    let lastSpawnY = 0;

    function spawnSmoke() {
      const puff = document.createElement("span");
      puff.className = "smoke-puff";
      puff.style.left = `${x + (flip === 1 ? -28 : 28)}px`;
      puff.style.top = `${y + 10}px`;
      puff.addEventListener("animationend", () => puff.remove(), { once: true });
      smokeLayer!.appendChild(puff);
    }

    function handleMouseMove(event: MouseEvent) {
      targetX = event.clientX;
      targetY = event.clientY;
      if (!started) {
        started = true;
        x = targetX;
        y = targetY;
        lastSpawnX = x;
        lastSpawnY = y;
        bus!.style.opacity = "1";
      }
    }

    function handleMouseLeave() {
      bus!.style.opacity = "0";
    }

    function handleMouseEnter() {
      if (started) bus!.style.opacity = "1";
    }

    function loop() {
      const dx = targetX - x;
      const dy = targetY - y;
      x += dx * 0.2;
      y += dy * 0.2;

      if (Math.abs(dx) > 0.8) flip = dx < 0 ? -1 : 1;
      tilt += (clamp(dx * 0.35, -12, 12) - tilt) * 0.18;

      bus!.style.transform =
        `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scaleX(${flip}) rotate(${tilt.toFixed(2)}deg)`;

      if (started && Math.hypot(x - lastSpawnX, y - lastSpawnY) > 16) {
        lastSpawnX = x;
        lastSpawnY = y;
        spawnSmoke();
      }

      frame = window.requestAnimationFrame(loop);
    }

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      smokeLayer.replaceChildren();
    };
  }, [customCursorEnabled]);

  function swapLocations() {
    setFrom(to);
    setTo(from);
    setSearchMessage("");
    setSwapSpin((turns) => turns + 1);
  }

  function applyRoute(routeFrom: string, routeTo: string) {
    setFrom(routeFrom);
    setTo(routeTo);
    setSearchMessage("");
  }

  const handleSearch = useCallback(() => {
    const cleanFrom = from.trim();
    const cleanTo = to.trim();

    if (!cleanFrom || !cleanTo) {
      setSearchMessage("Add a starting point and a destination to search.");
      return;
    }

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      setSearchMessage("Pick two different places — these are the same stop.");
      return;
    }

    if (!travelDate) {
      setSearchMessage("Pick the date you want to travel.");
      return;
    }

    setSearchMessage("");

    const params = new URLSearchParams({
      from: cleanFrom,
      to: cleanTo,
      date: travelDate,
    });

    router.push(`/search?${params.toString()}`);
  }, [from, to, travelDate, router]);

  const activeRoute = `${from.trim().toLowerCase()}→${to.trim().toLowerCase()}`;

  return (
    <main
      className={`min-h-screen ${customCursorEnabled ? "bus-cursor-active" : ""}`}
      style={{ backgroundColor: paper, color: ink }}
    >
      <style jsx global>{`
        @keyframes driveAcross {
          from {
            transform: translateX(-120px);
          }
          to {
            transform: translateX(calc(100vw + 120px));
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
          from {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0.5;
          }
          to {
            transform: translate(-50%, -50%) translateY(-20px) scale(1.8);
            opacity: 0;
          }
        }
        .decorated-bus-track {
          animation: driveAcross 22s linear infinite;
        }
        .floating-coffee-idle {
          animation: floatPulse 2.8s ease-in-out infinite;
        }
        .smoke-puff {
          position: fixed;
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background-color: rgba(80, 80, 80, 0.5);
          pointer-events: none;
          animation: smokePuff 650ms ease-out forwards;
        }
        /* Custom bus cursor: only applied when JS confirms a fine pointer and
           no reduced-motion preference, so touch and keyboard users keep the
           normal cursor. Text fields keep a caret so typing stays usable. */
        .bus-cursor-active,
        .bus-cursor-active * {
          cursor: none;
        }
        .bus-cursor-active input,
        .bus-cursor-active textarea {
          cursor: text;
        }
        :focus-visible {
          outline: 2px solid ${rust};
          outline-offset: 2px;
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
        className="sticky top-0 z-40 border-b backdrop-blur"
        style={{ borderColor: cardBorder, backgroundColor: "rgba(251,248,242,0.88)" }}
      >
        {/* <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-2.5 rounded-lg">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: ink }}
            >
              <Bus className="h-4.5 w-4.5" style={{ color: gold, height: 18, width: 18 }} />
            </span>
            <span className="text-base font-medium" style={{ ...displayFont, color: ink }}>
              Kerala Bus Finder
            </span>
          </a>

          <a
            href="https://t.me/Kerala_Bus_Finder_Bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-2 text-xs font-medium transition-colors hover:bg-[#F1ECDD]"
            style={{ borderColor: cardBorder, color: ink }}
          >
            <TelegramGlyph size={14} color={telegramBlue} />
            <span className="hidden sm:inline">Report a timing</span>
            <span className="sm:hidden">Report</span>
          </a>
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
              left: `clamp(18px, ${scrollProgress}%, calc(100% - 18px))`,
              transform: "translate(-50%, -50%)",
              filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.25))",
            }}
            aria-hidden
          >
            {/* <KsrtcBusIcon size={30} /> */}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: heroTint }}>
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: `radial-gradient(closest-side, ${gold}, transparent)` }}
        />

        <svg
          className="pointer-events-none absolute right-[-40px] top-[-20px] h-64 w-64 opacity-[0.35] sm:h-80 sm:w-80"
          viewBox="0 0 300 300"
          fill="none"
          aria-hidden="true"
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

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-18 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span
              className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs"
              style={{ borderColor: cardBorder, color: textMuted }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: green }} />
              KSRTC and private services, all 14 districts
            </span>

            <h1
              className="mt-4 text-[2rem] font-medium leading-[1.12] tracking-tight sm:text-[2.6rem] lg:text-5xl"
              style={{ ...displayFont, color: ink }}
            >
              Catch the right bus, every time.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7" style={{ color: textMuted }}>
              Search scheduled services between towns across Kerala — departure
              times, routes and stops, kept current by the people who ride them.
            </p>
          </div>

          {/* Search card */}
          <div
            className="relative mx-auto mt-9 max-w-4xl overflow-visible rounded-[28px] bg-white sm:mt-11"
            style={{
              border: `1px solid ${cardBorder}`,
              boxShadow: "0 36px 70px -36px rgba(22,48,43,0.35)",
            }}
          >
            <div
              className="h-1.5 w-full rounded-t-[28px]"
              style={{ background: `linear-gradient(90deg, ${rust}, ${gold} 70%, ${green})` }}
            />

            <div className="p-4 sm:p-7">
              <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
                <CityField
                  id="from"
                  label="From"
                  value={from}
                  onChange={(next) => {
                    setFrom(next);
                    setSearchMessage("");
                  }}
                  onSubmit={handleSearch}
                  iconColor={green}
                  placeholder="Starting point"
                />

                <button
                  type="button"
                  onClick={swapLocations}
                  aria-label="Swap starting point and destination"
                  className="mt-0 flex h-11 w-full items-center justify-center gap-2 rounded-full border bg-white text-sm font-medium shadow-sm transition-colors hover:bg-[#F1ECDD] md:mt-[30px] md:h-11 md:w-11"
                  style={{ borderColor: cardBorder, color: ink }}
                >
                  <ArrowLeftRight
                    className="h-4 w-4 transition-transform duration-500 ease-out"
                    style={{ transform: `rotate(${swapSpin * 180}deg)` }}
                  />
                  <span className="md:hidden">Swap</span>
                </button>

                <CityField
                  id="to"
                  label="To"
                  value={to}
                  onChange={(next) => {
                    setTo(next);
                    setSearchMessage("");
                  }}
                  onSubmit={handleSearch}
                  iconColor={rust}
                  placeholder="Destination"
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label htmlFor="travel-date" className="mb-2 block text-sm font-medium" style={{ color: ink }}>
                    Travel date
                  </label>
                  <div
                    className="flex items-center gap-2.5 rounded-2xl border bg-white px-3.5 py-3 transition-shadow focus-within:border-[#C7B98F] focus-within:shadow-[0_0_0_3px_rgba(199,154,61,0.22)]"
                    style={{ borderColor: cardBorder }}
                  >
                    <CalendarDays className="h-4 w-4 shrink-0" style={{ color: textFaint }} />
                    <input
                      id="travel-date"
                      type="date"
                      value={travelDate}
                      min={minDate || undefined}
                      onChange={(event) => {
                        setTravelDate(event.target.value);
                        setSearchMessage("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleSearch();
                      }}
                      className="w-full border-0 bg-transparent p-0 text-[15px] outline-none"
                      style={{ color: ink }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex h-[50px] w-full items-center justify-center gap-2 rounded-2xl px-7 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0 md:w-auto"
                  style={{
                    background: `linear-gradient(180deg, ${rust}, ${rustDeep})`,
                    boxShadow: "0 16px 28px -12px rgba(180,69,31,0.6)",
                  }}
                >
                  <Search className="h-4 w-4" />
                  Find buses
                </button>
              </div>

              {searchMessage && (
                <div
                  role="alert"
                  className="mt-4 rounded-xl border px-4 py-3 text-sm"
                  style={{ borderColor: "#E8C4B0", backgroundColor: "#FBEEE7", color: rustDeep }}
                >
                  {searchMessage}
                </div>
              )}
            </div>
          </div>

          {/* Popular routes */}
          <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2">
            <span className="text-xs" style={{ color: textFaint }}>
              Popular routes
            </span>
            {popularRoutes.map((route) => {
              const isActive =
                `${route.from.toLowerCase()}→${route.to.toLowerCase()}` === activeRoute;
              return (
                <button
                  key={`${route.from}-${route.to}`}
                  type="button"
                  onClick={() => applyRoute(route.from, route.to)}
                  className="rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    borderColor: isActive ? green : cardBorder,
                    backgroundColor: isActive ? "rgba(63,107,88,0.12)" : "#FFFFFF",
                    color: isActive ? green : ink,
                  }}
                >
                  {route.from} to {route.to}
                </button>
              );
            })}
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
        <div className="decorated-bus-track pointer-events-none absolute bottom-1.5 left-0" aria-hidden>
          <DecoratedBusIcon size={68} />
        </div>
      </div>

      {/* What you get */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-px overflow-hidden rounded-3xl border md:grid-cols-3" style={{ borderColor: cardBorder, backgroundColor: cardBorder }}>
          {[
            {
              icon: <Clock3 className="h-5 w-5" style={{ color: ink }} />,
              tint: "rgba(22,48,43,0.08)",
              title: "Scheduled timings, not guesswork",
              body:
                "Every result comes from a published timetable, so you know when a bus is meant to arrive — not just that one exists on the route.",
            },
            {
              icon: <Heart className="h-5 w-5" style={{ color: rust }} />,
              tint: "rgba(180,69,31,0.1)",
              title: "Save your regular routes",
              body:
                "Keep the buses you take every day a tap away, with the next few departures at the top.",
            },
            {
              icon: <Users className="h-5 w-5" style={{ color: green }} />,
              tint: "rgba(63,107,88,0.12)",
              title: "Built with local riders",
              body:
                "Missing a service or spotted a changed timing? Send it in and it goes into the next review.",
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white p-6 sm:p-7">
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: feature.tint }}
              >
                {feature.icon}
              </div>
              <h2 className="text-lg font-medium leading-snug" style={{ ...displayFont, color: ink }}>
                {feature.title}
              </h2>
              <p className="mt-2 text-sm leading-6" style={{ color: textMuted }}>
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Verification note */}
      <section className="border-t" style={{ borderColor: cardBorder }}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div
            className="flex items-start gap-3.5 rounded-2xl border bg-white p-5 sm:p-6"
            style={{ borderColor: cardBorder, boxShadow: "0 20px 40px -32px rgba(22,48,43,0.25)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: "rgba(63,107,88,0.12)" }}
            >
              <ShieldCheck className="h-5 w-5" style={{ color: green }} />
            </div>
            <div>
              <h2 className="text-sm font-medium">Not every timing is verified yet</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6" style={{ color: textMuted }}>
                Some entries are still community-submitted. Each one is checked
                against official schedules before it&apos;s marked verified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support and connect */}
      <section className="border-t" style={{ borderColor: cardBorder }}>
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto mb-9 max-w-xl text-center">
            <h2 className="text-2xl font-medium sm:text-3xl" style={{ ...displayFont, color: ink }}>
              Support and connect
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: textMuted }}>
              Help keep the project running, or send us bus timings, corrections
              and feature ideas.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Buy Me a Coffee */}
            <div
              className="relative overflow-hidden rounded-3xl border"
              style={{
                borderColor: "#F0E29C",
                background: `linear-gradient(135deg, #FFF6C2 0%, ${paper} 55%)`,
                boxShadow: "0 20px 45px -30px rgba(240,204,0,0.6)",
              }}
            >
              <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.08]">
                <CoffeeCupMark size={160} color={ink} />
              </div>

              <div className="relative flex h-full flex-col p-6 sm:p-8">
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: bmcYellow, boxShadow: "0 8px 20px -8px rgba(240,204,0,0.7)" }}
                >
                  <CoffeeCupMark size={24} color="#111111" />
                </div>

                <h3 className="text-xl font-medium" style={{ ...displayFont, color: ink }}>
                  Support Kerala Bus Finder
                </h3>

                <p className="mt-2 max-w-md flex-1 text-sm leading-6" style={{ color: textMuted }}>
                  The site is free and has no ads. A coffee covers the hosting
                  and the hours spent checking timetables.
                </p>

                <a
                  href="https://buymeacoffee.com/milanabraham"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-fit items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: bmcYellow,
                    boxShadow: "0 14px 28px -12px rgba(240,204,0,0.85)",
                    border: `1px solid ${bmcYellowDeep}`,
                  }}
                >
                  <CoffeeCupMark size={20} color="#111111" />
                  Buy me a coffee
                </a>
              </div>
            </div>

            {/* Telegram */}
            <div
              className="relative overflow-hidden rounded-3xl border"
              style={{
                borderColor: "#B9D9EC",
                background: `linear-gradient(135deg, #E8F6FF 0%, ${paper} 58%)`,
                boxShadow: "0 20px 45px -30px rgba(42,140,200,0.45)",
              }}
            >
              <div className="pointer-events-none absolute -right-4 -top-4 opacity-[0.07]">
                <TelegramGlyph size={150} color={telegramBlue} />
              </div>

              <div className="relative flex h-full flex-col p-6 sm:p-8">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: telegramBlue, boxShadow: "0 8px 20px -8px rgba(34,158,217,0.55)" }}
                >
                  <TelegramGlyph size={24} />
                </div>

                <h3 className="text-xl font-medium" style={{ ...displayFont, color: ink }}>
                  Message us on Telegram
                </h3>

                <p className="mt-2 max-w-md flex-1 text-sm leading-6" style={{ color: textMuted }}>
                  Report a wrong or missing bus, ask about a timetable, or
                  suggest something the site should do next.
                </p>

                <a
                  href="https://t.me/Kerala_Bus_Finder_Bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-fit items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: telegramBlue,
                    boxShadow: "0 14px 28px -12px rgba(34,158,217,0.6)",
                  }}
                >
                  <TelegramGlyph size={18} />
                  Open Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: cardBorder }}>
        <div
          className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-xs sm:flex-row sm:justify-between sm:text-left lg:px-8"
          style={{ color: textFaint }}
        >
          <span>Kerala Bus Finder — built for the road, not the boardroom.</span>
          <span>Timings can change without notice. Check locally before you travel.</span>
        </div>
      </footer>

      {/* Floating actions — one stack, so nothing overlaps */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 transition-all duration-500 ease-out"
        style={{
          opacity: showFloatingActions ? 1 : 0,
          transform: showFloatingActions ? "translateY(0)" : "translateY(18px)",
          pointerEvents: showFloatingActions ? "auto" : "none",
        }}
      >
        <a
          href="https://buymeacoffee.com/milanabraham"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Buy me a coffee"
          className="floating-coffee-idle inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
          style={{
            backgroundColor: bmcYellow,
            border: `1px solid ${bmcYellowDeep}`,
            boxShadow: "0 14px 28px -12px rgba(240,204,0,0.85)",
          }}
        >
          <CoffeeCupMark size={18} color="#111111" />
          <span className="hidden sm:inline">Buy me a coffee</span>
        </a>

        <a
          href="https://t.me/Kerala_Bus_Finder_Bot"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Kerala Bus Finder on Telegram"
          className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 hover:-translate-y-1"
          style={{
            backgroundColor: telegramBlue,
            boxShadow: "0 14px 30px -10px rgba(34,158,217,0.65)",
          }}
        >
          <div className="relative flex h-9 w-10 items-center justify-center rounded-[10px] border-2 border-white">
            <span className="absolute -top-3 left-1/2 h-2.5 w-[2px] -translate-x-1/2 bg-white" />
            <span className="absolute -top-[18px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />
            <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-white" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-white" />
            <span className="absolute bottom-1.5 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-white" />

          </div>
        </a>
      </div>

      {/* Custom bus cursor + trailing exhaust smoke */}
      {customCursorEnabled && (
        <>
          <div ref={smokeRef} className="pointer-events-none fixed inset-0 z-[60]" aria-hidden />
          <div
            ref={cursorRef}
            className="pointer-events-none fixed left-0 top-0 z-[70]"
            style={{ opacity: 0 }}
            aria-hidden
          >
            <SideBusIcon size={58} />
          </div>
        </>
      )}
    </main>
  );
}