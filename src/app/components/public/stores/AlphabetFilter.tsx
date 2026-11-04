
"use client";

import { X } from "lucide-react";

interface AlphabetFilterProps {
  selectedLetter: string;
  onLetterChange: (letter: string) => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AlphabetFilter({
  selectedLetter,
  onLetterChange,
}: AlphabetFilterProps) {
  return (
    <section aria-label="Browse stores alphabetically">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[var(--brand-navy)] sm:text-xl">
            Browse Stores A–Z
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Find stores by their first letter.
          </p>
        </div>

        {selectedLetter && (
          <button
            type="button"
            onClick={() => onLetterChange("")}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[var(--brand-purple)] transition hover:bg-purple-50"
          >
            <X size={15} />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {ALPHABET.map((letter) => {
          const isActive = selectedLetter === letter;

          return (
            <button
              key={letter}
              type="button"
              aria-pressed={isActive}
              aria-label={`Browse stores starting with ${letter}`}
              onClick={() =>
                onLetterChange(isActive ? "" : letter)
              }
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-all duration-200 sm:h-10 sm:w-10 ${
                isActive
                  ? "border-[var(--brand-purple)] bg-[var(--brand-purple)] text-white shadow-md shadow-purple-500/20"
                  : "border-gray-200 bg-white text-gray-600 hover:border-[var(--brand-purple)] hover:bg-purple-50 hover:text-[var(--brand-purple)]"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {selectedLetter && (
        <p className="mt-3 text-sm text-gray-500">
          Showing stores starting with{" "}
          <span className="font-semibold text-[var(--brand-purple)]">
            {selectedLetter}
          </span>
        </p>
      )}
    </section>
  );
}
