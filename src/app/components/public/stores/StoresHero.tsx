"use client";

import { useEffect, useRef } from "react";
import {
  Shirt, Plane, UtensilsCrossed, Laptop, Sparkles, Home, Gamepad2, Dumbbell,
  type LucideIcon,
} from "lucide-react";
import { Dancing_Script } from "next/font/google";

// module scope, same file as your hero section
const script = Dancing_Script({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

function Cursive({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className="inline-block whitespace-pre">
          <span className="text-[1.45em] leading-none">{word[0]}</span>
          {word.slice(1)}{" "}
        </span>
      ))}
    </>
  );
}






/* ---------- ticker words ---------- */
const WORDS = [
  "Fashion", "Electronics", "Travel", "Beauty",
  "Food", "Home", "Sports", "Gaming",
];

/* ---------- floating category chips (edges only, kept above the fade) ---------- */
type Chip = {
  Icon: LucideIcon; label: string;
  left: number; top: number; depth: number; dur: number; delay: number;
};
const CHIPS: Chip[] = [
  { Icon: Shirt,           label: "Fashion",     left: 5,  top: 14, depth: 26, dur: 7,  delay: -1 },
  { Icon: Laptop,          label: "Tech",        left: 3,  top: 40, depth: 14, dur: 9,  delay: -4 },
  { Icon: Plane,           label: "Travel",      left: 9,  top: 62, depth: 32, dur: 8,  delay: -2 },
  { Icon: Sparkles,        label: "Beauty",      left: 82, top: 12, depth: 20, dur: 8,  delay: -5 },
  { Icon: UtensilsCrossed, label: "Food",        left: 86, top: 38, depth: 30, dur: 7,  delay: -3 },
  { Icon: Gamepad2,        label: "Gaming",      left: 80, top: 60, depth: 16, dur: 10, delay: -6 },
  { Icon: Home,            label: "Home",        left: 19, top: 28, depth: 38, dur: 9,  delay: -7 },
  { Icon: Dumbbell,        label: "Sports",      left: 72, top: 26, depth: 36, dur: 8,  delay: -2 },
];

/* ---------- styles (kept inside this file) ---------- */
const STYLES = `
.sx-root {
  --mx: 0; --my: 0; --px: 50%; --py: 38%;
  --sx-fade: #ffffff; /* colour of the section below, change if it isn't pure white */
}

/* soft purple glow */
.sx-glow {
  position: absolute; inset: 0;
  background:
    radial-gradient(60% 55% at 50% 30%, color-mix(in srgb, var(--brand-purple) 34%, transparent), transparent 70%),
    radial-gradient(40% 40% at 90% 90%, color-mix(in srgb, var(--brand-yellow) 10%, transparent), transparent 70%);
}

/* halftone dots: faint base + yellow dots revealed around the cursor */
.sx-dots-base, .sx-dots-hot { position: absolute; inset: 0; background-size: 24px 24px; }
.sx-dots-base {
  background-image: radial-gradient(rgba(255,255,255,.55) 1.2px, transparent 1.7px);
  opacity: .12;
  -webkit-mask-image: radial-gradient(ellipse at 50% 40%, transparent 25%, #000 85%);
  mask-image: radial-gradient(ellipse at 50% 40%, transparent 25%, #000 85%);
}
.sx-dots-hot {
  background-image: radial-gradient(var(--brand-yellow) 1.8px, transparent 2.3px);
  opacity: .6;
  -webkit-mask-image: radial-gradient(260px circle at var(--px) var(--py), #000, transparent 70%);
  mask-image: radial-gradient(260px circle at var(--px) var(--py), #000, transparent 70%);
}

/* diagonal ticker tapes */
.sx-band {
  position: absolute; left: -10%; width: 120%;
  transform: translateY(calc(var(--my) * 18px)) rotate(-5deg);
  will-change: transform;
}
.sx-track { display: flex; width: max-content; animation: sx-marquee 70s linear infinite; }
.sx-track-rev { animation-direction: reverse; animation-duration: 85s; }
@keyframes sx-marquee { to { transform: translateX(-50%); } }
.sx-row { display: flex; align-items: center; gap: 2rem; padding-right: 2rem; }
.sx-word {
  display: inline-flex; align-items: center; gap: 2rem;
  font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 900; line-height: 1;
  text-transform: uppercase; letter-spacing: -0.02em; white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,.12);
}
.sx-band-yellow .sx-word { -webkit-text-stroke-color: color-mix(in srgb, var(--brand-yellow) 22%, transparent); }
.sx-star { font-size: .45em; -webkit-text-stroke: 0; color: color-mix(in srgb, var(--brand-yellow) 30%, transparent); }

/* floating chips */
.sx-chip-pos { position: absolute; will-change: transform; }
.sx-chip {
  display: inline-flex; align-items: center; gap: .5rem;
  padding: .55rem .95rem; border-radius: 9999px;
  font-size: .8rem; font-weight: 700; letter-spacing: .02em;
  color: rgba(112, 45, 145, 0.5);
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  animation: sx-bob 8s ease-in-out infinite;
}
.sx-chip svg { color: var(--brand-yellow); }
@keyframes sx-bob {
  0%,100% { transform: translateY(0) rotate(-1.5deg); }
  50%     { transform: translateY(-14px) rotate(1.5deg); }
}

/* white fade: starts at 75% height, pure white at the bottom edge */
.sx-fade {
  position: absolute; left: 0; right: 0; top: 0; bottom: -1px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 75%,
    color-mix(in srgb, var(--sx-fade) 40%, transparent) 84%,
    color-mix(in srgb, var(--sx-fade) 82%, transparent) 93%,
    var(--sx-fade) 100%
  );
}

/* text entrance + shimmer */
.sx-rise { opacity: 0; animation: sx-rise .7s cubic-bezier(.215,.61,.355,1) forwards; }
@keyframes sx-rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
.sx-shine {
  background: linear-gradient(100deg, var(--brand-yellow) 0%, var(--brand-yellow) 40%, #fff 50%, var(--brand-yellow) 60%, var(--brand-yellow) 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  animation: sx-shine 4.5s ease-in-out infinite;
}
@keyframes sx-shine { 0% { background-position: 120% 0; } 60%,100% { background-position: -20% 0; } }

@media (prefers-reduced-motion: reduce) {
  .sx-track, .sx-chip, .sx-shine { animation: none !important; }
  .sx-rise { animation: none; opacity: 1; }
}
`;

function Band({ top, reverse, yellow, hideOnMobile, }: { top: string; reverse?: boolean; yellow?: boolean; hideOnMobile?: boolean }) {
  return (
    <div
      className={`sx-band ${yellow ? "sx-band-yellow" : ""} ${hideOnMobile ? "hidden sm:block" : ""}`}
      style={{ top }}
    >
      <div className={`sx-track ${reverse ? "sx-track-rev" : ""}`}>
        {[0, 1].map((k) => (
          <div key={k} className="sx-row">
            {WORDS.map((w) => (
              <span key={w} className="sx-word">
                {w}
                <span className="sx-star">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StoresHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const host = sectionRef.current;
    const layer = layerRef.current;
    if (!host || !layer) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;
    let sx = 50, sy = 38, tsx = 50, tsy = 38;
    let raf = 0, running = false;

    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      sx += (tsx - sx) * 0.18;
      sy += (tsy - sy) * 0.18;

      layer.style.setProperty("--mx", cx.toFixed(4));
      layer.style.setProperty("--my", cy.toFixed(4));
      layer.style.setProperty("--px", `${sx.toFixed(2)}%`);
      layer.style.setProperty("--py", `${sy.toFixed(2)}%`);

      chipRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = CHIPS[i].depth;
        el.style.transform = `translate3d(${(-cx * d).toFixed(2)}px, ${(-cy * d).toFixed(2)}px, 0)`;
      });

      const settled =
        Math.abs(tx - cx) < 0.0005 && Math.abs(ty - cy) < 0.0005 &&
        Math.abs(tsx - sx) < 0.05 && Math.abs(tsy - sy) < 0.05;
      if (settled) running = false;
      else raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      tx = nx - 0.5; ty = ny - 0.5;
      tsx = nx * 100; tsy = ny * 100;
      start();
    };
    const onLeave = () => { tx = ty = 0; tsx = 50; tsy = 38; start(); };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden"
    >
      <style>{STYLES}</style>

      {/* ============ Background ============ */}
      <div
        ref={layerRef}
        aria-hidden="true"
        className="sx-root pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="sx-glow" />
        <div className="sx-dots-base" />
        <div className="sx-dots-hot" />

        <Band top="4%" />
        <Band top="50%" reverse yellow hideOnMobile />

        {CHIPS.map((c, i) => (
          <div
            key={c.label}
            ref={(el) => { chipRefs.current[i] = el; }}
            className="sx-chip-pos hidden lg:block"
            style={{ left: `${c.left}%`, top: `${c.top}%` }}
          >
            <div
              className="sx-chip"
              style={{ animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
            >
              <c.Icon size={16} strokeWidth={2} />
              {c.label}
            </div>
          </div>
        ))}

        {/* fade to white: must stay the LAST layer so it paints over the rest */}
        <div className="sx-fade" />
      </div>

      {/* ============ Content ============ */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-2 pt-16 text-center sm:px-6 sm:pb-2 sm:pt-20 lg:px-8 lg:pb-2 lg:pt-24">

        {/* <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[var(--brand-navy)] sm:text-4xl lg:text-5xl">
          <span className="sx-rise block text-xl md:text-2xl" style={{ animationDelay: "0.15s" }}>
            Find Your Favorite Stores.
          </span>
          <span className="sx-rise mt-2 block" style={{ animationDelay: "0.3s" }}>
            <span className="sx-shine">Discover Better Deals.</span>
          </span>
        </h1> */}
        <h1
          className={`max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-[var(--brand-navy)] sm:text-4xl lg:text-5xl`}
        >
          <span className={`sx-rise block text-2xl md:text-3xl ${script.className}`} style={{ animationDelay: "0.15s" }}>
            <Cursive text="Find Your Favorite Stores." />
          </span>
          <span className="sx-rise mt-2 block" style={{ animationDelay: "0.3s" }}>
            <span className="sx-shine">
              <Cursive text="Discover Better Deals." />
            </span>
          </span>
        </h1>

        <p
          className="sx-rise mt-5 max-w-4xl text-xs leading-7 text-black/65 sm:text-base"
          style={{ animationDelay: "0.45s" }}
        >
          Explore popular brands, browse stores across categories,
          and discover great deals and discounts on CouponsNext.
        </p>
      </div>
    </section>
  );
}