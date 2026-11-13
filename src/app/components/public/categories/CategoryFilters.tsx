"use client";
import { RotateCcw, Search, X } from "lucide-react";
type ContentType = "store" | "coupon" | "blog";
interface CategoryFiltersProps {
  searchInput: string;
  onSearchChange: (value: string) => void;

  selectedLetter: string;
  availableLetters: string[];
  onLetterChange: (letter: string) => void;

  selectedSort: string;
  onSortChange: (sort: string) => void;

  selectedFeatured: string;
  onFeaturedChange: (featured: string) => void;

  selectedContentTypes: ContentType[];
  onContentTypesChange: (contentTypes: ContentType[]) => void;

  hasActiveFilters: boolean;
  onClearFilters: () => void;

  instanceId: "desktop" | "mobile";
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CONTENT_TYPES: {
  value: ContentType;
  label: string;
  description: string;
}[] = [
  {
    value: "store",
    label: "Stores",
    description: "Shopping store categories",
  },
  {
    value: "coupon",
    label: "Coupons",
    description: "Coupon and discount categories",
  },
  {
    value: "blog",
    label: "Blogs",
    description: "Articles and blog categories",
  },
];

export default function CategoryFilters({
  searchInput,
  onSearchChange,
  selectedLetter,
  availableLetters,
  onLetterChange,
  selectedSort,
  onSortChange,
  selectedFeatured,
  onFeaturedChange,
  selectedContentTypes,
  onContentTypesChange,
  hasActiveFilters,
  onClearFilters,
  instanceId,
}: CategoryFiltersProps) {
  const searchId = `${instanceId}-category-search`;

  const handleContentTypeChange = (type: ContentType) => {
    const nextTypes = selectedContentTypes.includes(type)
      ? selectedContentTypes.filter((item) => item !== type)
      : [...selectedContentTypes, type];

    onContentTypesChange(nextTypes);
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[var(--border)] p-5">
        <h3 className="text-base font-bold text-[var(--brand-navy)]">
          Find Categories
        </h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Discover your favorite shopping categories.
        </p>
      </div>

      <div className="space-y-6 p-5">
        {/* Search */}
        <div>
          <label
            htmlFor={searchId}
            className="mb-2 block text-sm font-bold text-[var(--brand-navy)]"
          >
            Search Categories
          </label>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 transition focus-within:border-[var(--brand-purple)] focus-within:ring-2 focus-within:ring-[var(--brand-purple)]/10">
            <Search size={17} className="shrink-0 text-[var(--muted)]" />

            <input
              id={searchId}
              type="search"
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search categories..."
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[var(--brand-navy)] outline-none placeholder:text-gray-400"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="shrink-0 text-[var(--muted)] transition hover:text-[var(--brand-purple)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content Types */}
        <div>
          <h4 className="mb-3 text-sm font-bold text-[var(--brand-navy)]">
            Category Type
          </h4>

          <div className="space-y-3">
            {CONTENT_TYPES.map((type) => {
              const isChecked = selectedContentTypes.includes(type.value);

              return (
                <label
                  key={type.value}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--border)] p-3 transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)]"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleContentTypeChange(type.value)}
                    className="mt-0.5 size-4 shrink-0 cursor-pointer accent-[var(--brand-purple)]"
                  />

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[var(--brand-navy)]">
                      {type.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">
                      {type.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>

          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            Select one or more types. Leave all unchecked to show every
            category.
          </p>
        </div>

        {/* Featured filter */}
        <div>
          <label
            htmlFor={`${instanceId}-featured`}
            className="mb-2 block text-sm font-bold text-[var(--brand-navy)]"
          >
            Featured Categories
          </label>

          <select
            id={`${instanceId}-featured`}
            value={selectedFeatured}
            onChange={(event) => onFeaturedChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
          >
            <option value="">All Categories</option>
            <option value="true">Featured Only</option>
            <option value="false">Not Featured</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label
            htmlFor={`${instanceId}-sort`}
            className="mb-2 block text-sm font-bold text-[var(--brand-navy)]"
          >
            Sort Categories
          </label>

          <select
            id={`${instanceId}-sort`}
            value={selectedSort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
          >
            <option value="manual">Default Order</option>
            <option value="alphabetical">Name: A to Z</option>
          </select>
        </div>

        {/* Alphabet */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-[var(--brand-navy)]">
              Browse by Letter
            </h4>

            {selectedLetter && (
              <button
                type="button"
                onClick={() => onLetterChange("")}
                className="text-xs font-semibold text-[var(--brand-purple)] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => onLetterChange("")}
              aria-pressed={!selectedLetter}
              className={`col-span-6 rounded-lg px-3 py-2 text-xs font-bold transition ${
                !selectedLetter
                  ? "bg-[var(--brand-purple)] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)]"
              }`}
            >
              All Categories
            </button>

            {ALPHABET.map((letter) => {
              const isAvailable = availableLetters.includes(letter);
              const isSelected = selectedLetter === letter;

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onLetterChange(letter)}
                  aria-pressed={isSelected}
                  className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold transition ${
                    isSelected
                      ? "bg-[var(--brand-purple)] text-white"
                      : isAvailable
                        ? "border border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                        : "cursor-not-allowed border border-gray-100 bg-gray-50 text-gray-300"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            Select a letter to browse categories alphabetically.
          </p>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--brand-purple)] transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)]"
          >
            <RotateCcw size={15} />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
