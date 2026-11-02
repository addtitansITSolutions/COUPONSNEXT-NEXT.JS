
"use client";

import { useState } from "react";

interface StoreDescriptionProps {
  name: string;
  description: string;
}

export default function StoreDescription({
  name,
  description,
}: StoreDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!description?.trim()) return null;

  return (
    <section className="bg-[var(--brand-yellow)] px-4 pb-10 pt-8 sm:px-6 sm:pb-12 sm:pt-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-3 text-xl font-bold text-[var(--brand-navy)] sm:text-2xl">
          About {name}
        </h2>

        <p
          className={`text-sm leading-7 text-[var(--brand-navy)] sm:text-base ${
            expanded ? "" : "line-clamp-3"
          }`}
        >
          {description}
        </p>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="mt-3 text-sm font-bold text-[var(--brand-navy)] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          {expanded ? "Read Less" : "Read More"}
        </button>
      </div>
    </section>
  );
}
