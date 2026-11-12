
"use client";

interface CategoryAlphabetFilterProps {
  selectedLetter: string;
  availableLetters?: string[];
  onLetterChange: (letter: string) => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function CategoryAlphabetFilter({
  selectedLetter,
  availableLetters,
  onLetterChange,
}: CategoryAlphabetFilterProps) {
  return (
    <div className="w-full min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-[var(--brand-navy)]">
          Browse Alphabetically
        </h3>

        <span className="shrink-0 text-xs text-[var(--muted)]">
          Choose a letter
        </span>
      </div>

      <div className="flex w-full gap-2 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {/* All categories */}
        <button
          type="button"
          onClick={() => onLetterChange("")}
          aria-pressed={!selectedLetter}
          className={`flex h-10 min-w-11 shrink-0 items-center justify-center rounded-xl border px-4 text-sm font-bold transition ${
            !selectedLetter
              ? "border-[var(--brand-purple)] bg-[var(--brand-purple)] text-white shadow-sm"
              : "border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)]"
          }`}
        >
          All
        </button>

        {/* Alphabet letters */}
        {ALPHABET.map((letter) => {
          const isSelected = selectedLetter === letter;

          const isAvailable =
            !availableLetters || availableLetters.includes(letter);

          return (
            <button
              key={letter}
              type="button"
              disabled={!isAvailable}
              onClick={() => onLetterChange(letter)}
              aria-pressed={isSelected}
              aria-label={`Categories starting with ${letter}`}
              className={`flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition ${
                isSelected
                  ? "border-[var(--brand-purple)] bg-[var(--brand-purple)] text-white shadow-sm"
                  : isAvailable
                    ? "border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)]"
                    : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
