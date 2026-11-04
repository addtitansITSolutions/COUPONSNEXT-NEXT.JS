"use client";

import { useEffect, useRef } from "react";
import {
  Percent, Tag, Gift, Ticket, ShoppingBag, Star,
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
const R = mulberry32(77);
const between = (a: number, b: number) => +(a + R() * (b - a)).toFixed(2);
const pick = <T,>(arr: T[]) => arr[Math.floor(R() * arr.length)];

const FACE_ICONS: LucideIcon[] = [Percent, Tag, Gift, Ticket, ShoppingBag, Star];
const FACE_CLASSES = ["fs-f1", "fs-f2", "fs-f3", "fs-f4", "fs-f5", "fs-f6"];
const PURPLE = "var(--brand-purple)";
const YELLOW = "var(--brand-yellow)";

/* ---------- cubes ---------- */
const CUBE_POS: [number, number][] = [
  [4, 14], [18, 72], [33, 8], [47, 78], [61, 12],
  [75, 70], [89, 20], [94, 74], [10, 44],
];
const CUBES = CUBE_POS.map(([left, top], i) => ({
  left, top,
  size: Math.round(between(48, 88)),
  z: Math.round(between(-260, 180)),
  dur: between(14, 28),
  delay: -between(0, 20),
  floatDur: between(7, 12),
  rx: Math.round(between(10, 50)),
  // before                                                 // color: i % 3 === 1 ? YELLOW : PURPLE,
  // after
  color: YELLOW,
  rotateIcons: [0, 1, 2, 3, 4, 5].map((k) => FACE_ICONS[(k + i) % 6]),
  hideOnMobile: i % 2 === 1,
}));

/* ---------- flipping coupon cards ---------- */
const CARD_DATA = [
  { front: "50% OFF",   back: "CODE: SAVE50" },
  { front: "FREE SHIP", back: "NO MIN ORDER" },
  { front: "BUY 1 GET 1", back: "CODE: BOGO" },
  { front: "EXTRA 20%", back: "CODE: EXTRA20" },
  { front: "FLASH DEAL", back: "TODAY ONLY" },
];
const CARD_POS: [number, number][] = [[8, 30], [28, 58], [52, 34], [70, 12], [86, 52]];
const CARDS = CARD_POS.map(([left, top], i) => ({
  ...CARD_DATA[i],
  left, top,
  z: Math.round(between(-120, 220)),
  dur: between(9, 16),
  delay: -between(0, 12),
  floatDur: between(8, 13),
  tilt: Math.round(between(-18, 18)),
  color: i % 2 === 0 ? PURPLE : YELLOW,
  hideOnMobile: i % 2 === 1,
}));

/* ---------- orbs ---------- */
const ORBS = Array.from({ length: 9 }, (_, i) => ({
  left: between(2, 96),
  top: between(4, 92),
  size: Math.round(between(18, 56)),
  z: Math.round(between(-320, 260)),
  floatDur: between(6, 12),
  delay: -between(0, 10),
  color: i % 3 === 0 ? YELLOW : PURPLE,
  hideOnMobile: i % 2 === 0,
}));

/* ---------- rings ---------- */
const RINGS = [
  { left: 22, top: 30, size: 110, z: -80,  dur: 18, tilt: 68, color: PURPLE },
  { left: 66, top: 62, size: 150, z: -200, dur: 26, tilt: 62, color: YELLOW },
  { left: 82, top: 18, size: 90,  z: 120,  dur: 15, tilt: 72, color: PURPLE },
  { left: 40, top: 66, size: 70,  z: 160,  dur: 12, tilt: 65, color: YELLOW },
];

export default function HeroCouponBackground() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!layer || !host) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;
    let spotX = 50, spotY = 50, tSpotX = 50, tSpotY = 50;
    let raf = 0, running = false;

    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      spotX += (tSpotX - spotX) * 0.15;
      spotY += (tSpotY - spotY) * 0.15;

      layer.style.setProperty("--mx", cx.toFixed(4));
      layer.style.setProperty("--my", cy.toFixed(4));
      layer.style.setProperty("--px", `${spotX.toFixed(2)}%`);
      layer.style.setProperty("--py", `${spotY.toFixed(2)}%`);

      const settled =
        Math.abs(tx - cx) < 0.0005 && Math.abs(ty - cy) < 0.0005 &&
        Math.abs(tSpotX - spotX) < 0.05 && Math.abs(tSpotY - spotY) < 0.05;
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
      tx = nx - 0.5;
      ty = ny - 0.5;
      tSpotX = nx * 100;
      tSpotY = ny * 100;
      start();
    };
    const onLeave = () => { tx = ty = 0; tSpotX = tSpotY = 50; start(); };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="fs-root pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* cursor spotlight */}
      <div className="fs-spotlight absolute inset-0" />

      {/* perspective grid floor */}
      <div className="fs-floor-wrap absolute inset-x-0 bottom-0 h-[55%]">
        <div className="fs-floor" />
      </div>

      {/* 3D scene */}
      <div className="fs-scene absolute inset-0">
        <div className="fs-stage absolute inset-0">
          {/* rings */}
          {RINGS.map((r, i) => (
            <div
              key={`r${i}`}
              className="fs-item hidden sm:block"
              style={{ left: `${r.left}%`, top: `${r.top}%`, transform: `translateZ(${r.z}px)` }}
            >
              <div
                className="fs-ring"
                style={{
                  width: r.size, height: r.size,
                  animationDuration: `${r.dur}s`,
                  ["--tilt" as string]: `${r.tilt}deg`,
                  ["--c" as string]: r.color,
                }}
              />
            </div>
          ))}

          {/* orbs */}
          {ORBS.map((o, i) => (
            <div
              key={`o${i}`}
              className={`fs-item ${o.hideOnMobile ? "hidden sm:block" : ""}`}
              style={{ left: `${o.left}%`, top: `${o.top}%`, transform: `translateZ(${o.z}px)` }}
            >
              <div
                className="fs-float"
                style={{ animationDuration: `${o.floatDur}s`, animationDelay: `${o.delay}s` }}
              >
                <div
                  className="fs-orb"
                  style={{ width: o.size, height: o.size, ["--c" as string]: o.color }}
                />
              </div>
            </div>
          ))}

          {/* cubes */}
          {CUBES.map((c, i) => (
            <div
              key={`c${i}`}
              className={`fs-item ${c.hideOnMobile ? "hidden sm:block" : ""}`}
              style={{ left: `${c.left}%`, top: `${c.top}%`, transform: `translateZ(${c.z}px)` }}
            >
              <div
                className="fs-float"
                style={{ animationDuration: `${c.floatDur}s`, animationDelay: `${c.delay}s` }}
              >
                <div
                  className="fs-cube"
                  style={{
                    width: c.size, height: c.size,
                    animationDuration: `${c.dur}s`,
                    animationDelay: `${c.delay}s`,
                    ["--s" as string]: `${c.size}px`,
                    ["--rx" as string]: `${c.rx}deg`,
                    ["--c" as string]: c.color,
                  }}
                >
                  {c.rotateIcons.map((Icon, k) => (
                    <div key={k} className={`fs-face ${FACE_CLASSES[k]}`}>
                      <Icon size={c.size * 0.42} strokeWidth={1.75} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* flipping coupon cards */}
          {CARDS.map((c, i) => (
            <div
              key={`k${i}`}
              className={`fs-item ${c.hideOnMobile ? "hidden md:block" : ""}`}
              style={{ left: `${c.left}%`, top: `${c.top}%`, transform: `translateZ(${c.z}px)` }}
            >
              <div
                className="fs-float"
                style={{ animationDuration: `${c.floatDur}s`, animationDelay: `${c.delay}s` }}
              >
                <div
                  className="fs-card"
                  style={{
                    animationDuration: `${c.dur}s`,
                    animationDelay: `${c.delay}s`,
                    ["--tilt" as string]: `${c.tilt}deg`,
                    ["--c" as string]: c.color,
                  }}
                >
                  <div className="fs-card-face">
                    <Ticket size={14} strokeWidth={2.2} />
                    <span>{c.front}</span>
                  </div>
                  <div className="fs-card-face fs-card-back">
                    <span>{c.back}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}