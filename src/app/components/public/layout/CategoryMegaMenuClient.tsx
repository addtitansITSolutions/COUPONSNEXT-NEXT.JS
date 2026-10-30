"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Grid2X2,
  Sparkles,
} from "lucide-react";

export interface MegaMenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

interface CategoryMegaMenuClientProps {
  categories: MegaMenuCategory[];
}

export default function CategoryMegaMenuClient({
  categories,
}: CategoryMegaMenuClientProps) {
  const [open, setOpen] = useState(false);

  const visibleCategories = categories.slice(0, 7);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <Link
        href="/category"
        aria-haspopup="true"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(false)}
        className="flex h-11 shrink-0 items-center gap-2 text-xs font-bold transition-colors hover:text-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand-purple)]"
        style={{ color: "var(--brand-purple)" }}
      >
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            backgroundColor: "var(--accent-light)",
            color: "var(--brand-purple)",
          }}
        >
          <Grid2X2 size={15} />
        </span>

        Explore categories

        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </Link>

      {open && (
        <div
          className="absolute left-0 top-full z-50 w-[min(560px,calc(100vw-32px))] pt-3"
        >
          <div
            className="overflow-hidden rounded-2xl border shadow-2xl"
            style={{
              backgroundColor: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-5 py-4"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--accent-light)",
              }}
            >
              <div>
                <p
                  className="flex items-center gap-2 text-sm font-bold"
                  style={{ color: "var(--foreground)" }}
                >
                  <Sparkles
                    size={16}
                    style={{ color: "var(--brand-purple)" }}
                  />
                  Explore categories
                </p>

                <p
                  className="mt-1 text-xs"
                  style={{ color: "var(--muted)" }}
                >
                  Find offers for the things you love
                </p>
              </div>

              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                style={{
                  backgroundColor: "var(--background)",
                  color: "var(--brand-purple)",
                }}
              >
                {categories.length} categories
              </span>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-2 gap-1 p-3">
              {visibleCategories.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  onClick={() => setOpen(false)}
                  className="group flex min-w-0 items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[var(--accent-light)] focus-visible:bg-[var(--accent-light)] focus-visible:outline-none"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition-colors"
                    style={{
                      backgroundColor:
                        index % 2 === 0
                          ? "var(--accent-light)"
                          : "#fff8df",
                      color:
                        index % 2 === 0
                          ? "var(--brand-purple)"
                          : "var(--brand-navy)",
                    }}
                  >
                    {category.name.charAt(0).toUpperCase()}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className="block text-sm font-semibold transition-colors group-hover:text-[var(--brand-purple)]"
                      style={{ color: "var(--foreground)" }}
                    >
                      {category.name}
                    </span>

                    {category.description && (
                      <span
                        className="mt-1 block text-xs leading-4"
                        style={{ color: "var(--muted)" }}
                      >
                        {category.description}
                      </span>
                    )}
                  </span>

                  <ChevronRight
                    size={14}
                    className="mt-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: "var(--brand-purple)" }}
                  />
                </Link>
              ))}
            </div>

            {/* View All */}
            <div
              className="border-t p-3"
              style={{ borderColor: "var(--border)" }}
            >
              <Link
                href="/category"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors hover:bg-[var(--accent-hover)]"
                style={{
                  backgroundColor: "var(--brand-purple)",
                  color: "var(--brand-white)",
                }}
              >
                View all categories
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}