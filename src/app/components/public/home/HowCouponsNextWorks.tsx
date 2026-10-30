
"use client";

import { useRef } from "react";
import {
  Search,
  TicketPercent,
  Copy,
  ShoppingBag,
  BadgeCheck,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Find your offer",
    description:
      "Explore popular stores and discover the latest coupons and deals.",
    icon: Search,
  },
  {
    number: "02",
    title: "Choose your coupon",
    description:
      "Find the perfect coupon code or special deal for your purchase.",
    icon: TicketPercent,
  },
  {
    number: "03",
    title: "Copy your code",
    description:
      "Copy your coupon code and we'll take you directly to the store.",
    icon: Copy,
  },
  {
    number: "04",
    title: "Shop and save",
    description:
      "Apply your code at checkout or activate the deal to enjoy savings.",
    icon: ShoppingBag,
  },
  {
    number: "05",
    title: "Enjoy the savings",
    description:
      "Complete your purchase and enjoy a better deal on your order.",
    icon: BadgeCheck,
  },
];

export default function HowCouponsNextWorks() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const scrollSteps = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left:
        (direction === "right" ? 1 : -1) *
        scrollRef.current.clientWidth * 0.8,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      aria-labelledby="how-couponsnext-works-heading"
      className="overflow-hidden bg-white py-10 sm:py-12 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-7 flex items-center justify-between gap-4 sm:mb-9">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.2em] text-[var(--brand-purple)]">
              Shopping made simple
            </p>

            <h2
              id="how-couponsnext-works-heading"
              className="font-heading text-2xl font-black tracking-tight text-[var(--brand-navy)] sm:text-3xl lg:text-4xl"
            >
              How{" "}
              <span className="text-[var(--brand-purple)]">
                CouponsNext
              </span>{" "}
              Works
            </h2>
          </div>

          {/* Navigation */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => scrollSteps("left")}
              aria-label="Previous steps"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--brand-navy)] transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] active:scale-95 sm:h-11 sm:w-11"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => scrollSteps("right")}
              aria-label="Next steps"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-purple)] text-white shadow-sm transition hover:bg-[var(--accent-hover)] active:scale-95 sm:h-11 sm:w-11"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Steps Carousel */}
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
        >
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.number}
                whileHover={
                  prefersReducedMotion ? undefined : { y: -1 }
                }
                transition={{ duration: 0.2 }}
                className="group relative flex min-h-[190px] w-[285px] shrink-0 snap-start items-center justify-between gap-3 overflow-hidden rounded-2xl border-2 border-[var(--brand-yellow)] bg-[#FFFCF5] p-5 transition-colors hover:border-[var(--brand-purple)] sm:min-h-[210px] sm:w-[calc((100%-20px)/2)] sm:p-6 lg:w-[calc((100%-60px)/4)]"
              >
                {/* Step Number */}
                <span className="absolute right-4 top-3 text-xs font-black tracking-widest text-[var(--brand-purple)]/40">
                  {step.number}
                </span>

                {/* Text */}
                <div className="relative z-10 min-w-0 flex-1">
                  <h3 className="max-w-[180px] font-heading text-lg font-extrabold leading-tight text-[var(--brand-purple)] sm:text-xl">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-[190px] text-xs leading-5 text-[var(--brand-navy)]/80 sm:text-sm sm:leading-6">
                    {step.description}
                  </p>
                </div>

                {/* Illustration Icon */}
                <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] transition-transform duration-300 group-hover:scale-110 sm:h-[90px] sm:w-[90px]">
                  <div className="absolute inset-2 rounded-full border border-[var(--brand-purple)]/10" />

                  <Icon
                    size={36}
                    strokeWidth={1.8}
                    className="text-[var(--brand-purple)] sm:h-10 sm:w-10"
                  />
                </div>

                {/* Decorative bottom accent */}
                <div className="absolute bottom-0 left-5 right-5 h-1 rounded-t-full bg-[var(--brand-yellow)] transition-colors group-hover:bg-[var(--brand-purple)]" />
              </motion.article>
            );
          })}
        </div>

        {/* Bottom Supporting Text */}
        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-medium text-[var(--muted)] sm:mt-6 sm:text-sm">
          <ExternalLink size={14} className="text-[var(--brand-purple)]" />
          Find offers, shop smarter, and save more with CouponsNext.
        </div>
      </div>
    </section>
  );
}
