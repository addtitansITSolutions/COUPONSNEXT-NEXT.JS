"use client";

import { useEffect, useRef } from "react";
import {
  Ticket, Percent, Tag, Scissors, Gift, BadgePercent,
  ShoppingBag, Sparkles, ShoppingCart, Store, Star, Heart,
  type LucideIcon,
} from "lucide-react";

/* ---------- deterministic random (same on server + client) ---------- */
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2024);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => a + rand() * (b - a);

/* ---------- icon field ---------- */
const ICONS: LucideIcon[] = [
  Ticket, Percent, Tag, Scissors, Gift, BadgePercent,
  ShoppingBag, ShoppingCart, Store, Star, Heart, Sparkles,
];
const ANIMS = ["cf-float", "cf-sway", "cf-bob", "cf-pulse", "cf-spin"];
const COLORS = ["var(--brand-purple)", "var(--brand-purple)", "#ffffff"];

type Item = {
  Icon: LucideIcon; left: number; top: number; size: number; depth: number;
  anim: string; dur: number; delay: number; rot: number; opacity: number;
  color: string; hideOnMobile: boolean;
};

const COLS = 8, ROWS = 4;
const ITEMS: Item[] = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS, r = Math.floor(i / COLS);
  const Icon = pick(ICONS);
  const spinny = Icon === Percent || Icon === BadgePercent || Icon === Sparkles;
  const color = pick(COLORS);
  return {
    Icon,
    left: ((c + between(0.1, 0.8)) / COLS) * 100,
    top: ((r + between(0.1, 0.8)) / ROWS) * 100,
    size: Math.round(between(30, 66)),
    depth: Math.round(between(10, 40)),
    anim: spinny ? pick(["cf-spin", "cf-pulse"]) : pick(ANIMS.slice(0, 4)),
    dur: +between(7, 16).toFixed(1),
    delay: -+between(0, 14).toFixed(1),
    rot: Math.round(between(-30, 30)),
    opacity: +(color === "#ffffff" ? between(0.3, 0.5) : between(0.14, 0.26)).toFixed(2),
    color,
    hideOnMobile: i % 2 === 1,
  };
});

/* ---------- drifting ticket coupons ---------- */
const TICKETS = [
  { text: "50% OFF",       top: 14, dur: 55, delay: -10, rot: -6,  hide: false },
  { text: "FREE SHIPPING", top: 38, dur: 70, delay: -42, rot: 4,   hide: true  },
  { text: "BUY 1 GET 1",   top: 62, dur: 60, delay: -25, rot: -3,  hide: false },
  { text: "SAVE $20",      top: 82, dur: 48, delay: -5,  rot: 7,   hide: true  },
  { text: "FLASH DEAL",    top: 26, dur: 80, delay: -60, rot: 3,   hide: true  },
  { text: "EXTRA 15%",     top: 72, dur: 66, delay: -50, rot: -5,  hide: false },
];

/* ---------- sparkles ---------- */
const SPARKLES = Array.from({ length: 26 }, (_, i) => ({
  left: +between(1, 99).toFixed(1),
  top: +between(2, 98).toFixed(1),
  size: Math.round(between(4, 10)),
  dur: +between(2.5, 6).toFixed(1),
  delay: -+between(0, 6).toFixed(1),
  hide: i % 2 === 0,
}));

const REPEL_RADIUS = 170;
const REPEL_FORCE = 70;

export default function HeroCouponBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!layer || !host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    // cached base centres (px, relative to host)
    let bases: { x: number; y: number }[] = [];
    const measure = () => {
      const w = host.clientWidth, h = host.clientHeight;
      bases = ITEMS.map((it) => ({
        x: (it.left / 100) * w + it.size / 2,
        y: (it.top / 100) * h + it.size / 2,
      }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);

    const cur = ITEMS.map(() => ({ x: 0, y: 0 }));
    let px = -9999, py = -9999;       // pointer (host coords)
    let mx = 0, my = 0;               // normalised -0.5..0.5
    let raf = 0, running = false;

    const tick = () => {
      let moving = false;
      for (let i = 0; i < ITEMS.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        const { depth } = ITEMS[i];
        let tx = -mx * depth, ty = -my * depth;

        const dx = bases[i].x - px, dy = bases[i].y - py;
        const d = Math.hypot(dx, dy);
        if (d < REPEL_RADIUS && d > 0.01) {
          const f = Math.pow(1 - d / REPEL_RADIUS, 2) * REPEL_FORCE;
          tx += (dx / d) * f;
          ty += (dy / d) * f;
        }

        const c = cur[i];
        c.x += (tx - c.x) * 0.12;
        c.y += (ty - c.y) * 0.12;
        if (Math.abs(tx - c.x) > 0.05 || Math.abs(ty - c.y) > 0.05) moving = true;
        el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0)`;
      }
      if (moving) raf = requestAnimationFrame(tick);
      else running = false;
    };
    const start = () => {
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      mx = px / r.width - 0.5;
      my = py / r.height - 0.5;
      start();
    };
    const onLeave = () => { px = py = -9999; mx = my = 0; start(); };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Layer 1: sparkles */}
      {SPARKLES.map((s, i) => (
        <span
          key={`s${i}`}
          className={`cf-twinkle absolute rounded-full bg-white ${s.hide ? "hidden sm:block" : ""}`}
          style={{
            left: `${s.left}%`, top: `${s.top}%`,
            width: s.size, height: s.size,
            animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Layer 2: icon field */}
      {ITEMS.map((it, i) => (
        <div
          key={`i${i}`}
          ref={(el) => { itemRefs.current[i] = el; }}
          className={`absolute ${it.hideOnMobile ? "hidden sm:block" : ""}`}
          style={{ left: `${it.left}%`, top: `${it.top}%`, willChange: "transform" }}
        >
          <div
            className="cf-anim"
            style={{
              animationName: it.anim,
              animationDuration: `${it.dur}s`,
              animationDelay: `${it.delay}s`,
              animationTimingFunction: it.anim === "cf-spin" ? "linear" : "ease-in-out",
              ["--r" as string]: `${it.rot}deg`,
            }}
          >
            <it.Icon
              strokeWidth={1.5}
              style={{ width: it.size, height: it.size, opacity: it.opacity, color: it.color }}
            />
          </div>
        </div>
      ))}

      {/* Layer 3: drifting tickets */}
      {TICKETS.map((t, i) => (
        <div
          key={`t${i}`}
          className={`absolute left-0 ${t.hide ? "hidden md:block" : ""}`}
          style={{ top: `${t.top}%` }}
        >
          <div
            className="cf-ticket-travel"
            style={{ animationDuration: `${t.dur}s`, animationDelay: `${t.delay}s` }}
          >
            <div className="cf-ticket" style={{ transform: `rotate(${t.rot}deg)` }}>
              <Ticket size={16} strokeWidth={2} />
              <span>{t.text}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}