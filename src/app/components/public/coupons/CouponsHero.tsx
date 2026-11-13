
"use client";

import { useEffect, useRef } from "react";
import {
  TicketPercent,
  Tag,
  BadgePercent,
  ShoppingBag,
  Gift,
  Zap,
  Percent,
  CircleDollarSign,
  type LucideIcon,
} from "lucide-react";
import { Dancing_Script } from "next/font/google";

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
  "Save More",
  "Hot Deals",
  "Best Offers",
  "Coupon Codes",
  "Big Savings",
  "Special Deals",
  "Save More",
  "Hot Deals",
];

/* ---------- floating deal chips ---------- */

type Chip = {
  Icon: LucideIcon;
  label: string;
  left: number;
  top: number;
  depth: number;
  dur: number;
  delay: number;
};

const CHIPS: Chip[] = [
  {
    Icon: TicketPercent,
    label: "Coupon Codes",
    left: 5,
    top: 15,
    depth: 26,
    dur: 7,
    delay: -1,
  },
  {
    Icon: BadgePercent,
    label: "Up to 50% OFF",
    left: 3,
    top: 43,
    depth: 14,
    dur: 9,
    delay: -4,
  },
  {
    Icon: Zap,
    label: "Flash Deals",
    left: 8,
    top: 68,
    depth: 32,
    dur: 8,
    delay: -2,
  },
  {
    Icon: Gift,
    label: "Special Offers",
    left: 82,
    top: 13,
    depth: 20,
    dur: 8,
    delay: -5,
  },
  {
    Icon: ShoppingBag,
    label: "Shop & Save",
    left: 86,
    top: 41,
    depth: 30,
    dur: 7,
    delay: -3,
  },
  {
    Icon: CircleDollarSign,
    label: "More Savings",
    left: 80,
    top: 66,
    depth: 16,
    dur: 10,
    delay: -6,
  },
  {
    Icon: Tag,
    label: "Exclusive Deals",
    left: 19,
    top: 29,
    depth: 38,
    dur: 9,
    delay: -7,
  },
  {
    Icon: Percent,
    label: "Extra Discounts",
    left: 72,
    top: 27,
    depth: 36,
    dur: 8,
    delay: -2,
  },
];

/* ---------- styles ---------- */

const STYLES = `
.cn-root {
  --mx: 0;
  --my: 0;
  --px: 50%;
  --py: 38%;
  --cn-fade: #ffffff;
}

/* Background glow */
.cn-glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      60% 55% at 50% 30%,
      color-mix(in srgb, var(--brand-purple) 34%, transparent),
      transparent 70%
    ),
    radial-gradient(
      40% 40% at 90% 90%,
      color-mix(in srgb, var(--brand-yellow) 10%, transparent),
      transparent 70%
    );
}

/* Halftone dots */
.cn-dots-base,
.cn-dots-hot {
  position: absolute;
  inset: 0;
  background-size: 24px 24px;
}

.cn-dots-base {
  background-image: radial-gradient(
    rgba(255,255,255,.55) 1.2px,
    transparent 1.7px
  );
  opacity: .12;
  -webkit-mask-image: radial-gradient(
    ellipse at 50% 40%,
    transparent 25%,
    #000 85%
  );
  mask-image: radial-gradient(
    ellipse at 50% 40%,
    transparent 25%,
    #000 85%
  );
}

.cn-dots-hot {
  background-image: radial-gradient(
    var(--brand-yellow) 1.8px,
    transparent 2.3px
  );
  opacity: .6;
  -webkit-mask-image: radial-gradient(
    260px circle at var(--px) var(--py),
    #000,
    transparent 70%
  );
  mask-image: radial-gradient(
    260px circle at var(--px) var(--py),
    #000,
    transparent 70%
  );
}

/* Diagonal ticker bands */
.cn-band {
  position: absolute;
  left: -10%;
  width: 120%;
  transform: translateY(calc(var(--my) * 18px)) rotate(-5deg);
  will-change: transform;
}

.cn-track {
  display: flex;
  width: max-content;
  animation: cn-marquee 70s linear infinite;
}

.cn-track-rev {
  animation-direction: reverse;
  animation-duration: 85s;
}

@keyframes cn-marquee {
  to {
    transform: translateX(-50%);
  }
}

.cn-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-right: 2rem;
}

.cn-word {
  display: inline-flex;
  align-items: center;
  gap: 2rem;
  font-size: clamp(3rem, 8vw, 6.5rem);
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  letter-spacing: -.02em;
  white-space: nowrap;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,.12);
}

.cn-band-yellow .cn-word {
  -webkit-text-stroke-color: color-mix(
    in srgb,
    var(--brand-yellow) 22%,
    transparent
  );
}

.cn-star {
  font-size: .45em;
  -webkit-text-stroke: 0;
  color: color-mix(in srgb, var(--brand-yellow) 30%, transparent);
}

/* Floating chips */
.cn-chip-pos {
  position: absolute;
  will-change: transform;
}

.cn-chip {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .55rem .95rem;
  border-radius: 9999px;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .02em;
  color: rgba(112, 45, 145, 0.5);
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  animation: cn-bob 8s ease-in-out infinite;
}

.cn-chip svg {
  color: var(--brand-yellow);
}

@keyframes cn-bob {
  0%, 100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-14px) rotate(1.5deg);
  }
}

/* Fade into coupons section */
.cn-fade {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: -1px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    transparent 75%,
    color-mix(in srgb, var(--cn-fade) 40%, transparent) 84%,
    color-mix(in srgb, var(--cn-fade) 82%, transparent) 93%,
    var(--cn-fade) 100%
  );
}

/* Text animations */
.cn-rise {
  opacity: 0;
  animation: cn-rise .7s cubic-bezier(.215,.61,.355,1) forwards;
}

@keyframes cn-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.cn-shine {
  background: linear-gradient(
    100deg,
    var(--brand-yellow) 0%,
    var(--brand-yellow) 40%,
    #fff 50%,
    var(--brand-yellow) 60%,
    var(--brand-yellow) 100%
  );
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: cn-shine 4.5s ease-in-out infinite;
}

@keyframes cn-shine {
  0% {
    background-position: 120% 0;
  }
  60%, 100% {
    background-position: -20% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cn-track,
  .cn-chip,
  .cn-shine {
    animation: none !important;
  }

  .cn-rise {
    animation: none;
    opacity: 1;
  }
}
`;

/* ---------- ticker component ---------- */

function Band({
  top,
  reverse,
  yellow,
  hideOnMobile,
}: {
  top: string;
  reverse?: boolean;
  yellow?: boolean;
  hideOnMobile?: boolean;
}) {
  return (
    <div
      className={`cn-band ${yellow ? "cn-band-yellow" : ""} ${
        hideOnMobile ? "hidden sm:block" : ""
      }`}
      style={{ top }}
    >
      <div className={`cn-track ${reverse ? "cn-track-rev" : ""}`}>
        {[0, 1].map((k) => (
          <div key={k} className="cn-row">
            {WORDS.map((word, i) => (
              <span key={`${word}-${i}`} className="cn-word">
                {word}
                <span className="cn-star">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- hero ---------- */

export default function CouponsHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const host = sectionRef.current;
    const layer = layerRef.current;

    if (!host || !layer) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const coarse = window.matchMedia("(pointer: coarse)").matches;

    if (reduce || coarse) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    let sx = 50;
    let sy = 38;
    let tsx = 50;
    let tsy = 38;

    let raf = 0;
    let running = false;

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

        const depth = CHIPS[i].depth;

        el.style.transform = `translate3d(
          ${(-cx * depth).toFixed(2)}px,
          ${(-cy * depth).toFixed(2)}px,
          0
        )`;
      });

      const settled =
        Math.abs(tx - cx) < 0.0005 &&
        Math.abs(ty - cy) < 0.0005 &&
        Math.abs(tsx - sx) < 0.05 &&
        Math.abs(tsy - sy) < 0.05;

      if (settled) {
        running = false;
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();

      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;

      tx = nx - 0.5;
      ty = ny - 0.5;
      tsx = nx * 100;
      tsy = ny * 100;

      start();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      tsx = 50;
      tsy = 38;
      start();
    };

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
      className="relative isolate overflow-hidden pb-10 lg:pb-24"
    >
      <style>{STYLES}</style>

      {/* Background */}
      <div
        ref={layerRef}
        aria-hidden="true"
        className="cn-root pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="cn-glow" />
        <div className="cn-dots-base" />
        <div className="cn-dots-hot" />

        <Band top="4%" />
        <Band top="50%" reverse yellow hideOnMobile />

        {CHIPS.map((chip, i) => (
          <div
            key={chip.label}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            className="cn-chip-pos hidden lg:block"
            style={{
              left: `${chip.left}%`,
              top: `${chip.top}%`,
            }}
          >
            <div
              className="cn-chip"
              style={{
                animationDuration: `${chip.dur}s`,
                animationDelay: `${chip.delay}s`,
              }}
            >
              <chip.Icon size={16} strokeWidth={2} />
              {chip.label}
            </div>
          </div>
        ))}

        <div className="cn-fade" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-0 pt-10 text-center sm:px-6 sm:pt-10 lg:px-8 lg:pt-24">
        <h1 className="max-w-4xl text-3xl font-semibold leading-tight tracking-tight text-black sm:text-4xl lg:text-5xl">
          <span
            className={`cn-rise block text-xl md:text-3xl ${script.className}`}
            style={{ animationDelay: "0.2s" }}
          >
            <Cursive text="Find More Ways to Save." />
          </span>

          <span
            className="cn-rise mt-2 block"
            style={{ animationDelay: "0.35s" }}
          >
            <span className="cn-shine text-2xl md:text-3xl">
              <Cursive text="Discover Deals You’ll Love." />
            </span>
          </span>
        </h1>

        {/* <p
          className="cn-rise mt-5 max-w-3xl text-xs leading-7 text-white/70 sm:text-base"
          style={{ animationDelay: "0.5s" }}
        >
          Explore verified coupon codes, exclusive discounts, and handpicked
          deals from your favorite brands. Shop smarter and save on every
          purchase with CouponsNext.
        </p> */}
      </div>
    </section>
  );
}