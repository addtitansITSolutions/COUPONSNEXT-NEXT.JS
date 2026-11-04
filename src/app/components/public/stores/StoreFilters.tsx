"use client";

import { SlidersHorizontal, X } from "lucide-react";

import StoreSearch from "@/components/public/stores/StoreSearch";
import AlphabetFilter from "@/components/public/stores/AlphabetFilter";
import StoreCategoryFilter from "@/components/public/stores/StoreCategoryFilter";

interface StoreCategory {
  id: string;
  name: string;
  slug: string;
}

interface StoreFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  selectedLetter: string;
  onLetterChange: (letter: string) => void;

  categories: StoreCategory[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;

  sort: string;
  onSortChange: (sort: string) => void;

  featured: string;
  onFeaturedChange: (featured: string) => void;

  onClear: () => void;
}

export default function StoreFilters({
  search,
  onSearchChange,
  selectedLetter,
  onLetterChange,
  categories,
  selectedCategory,
  onCategoryChange,
  sort,
  onSortChange,
  featured,
  onFeaturedChange,
  onClear,
}: StoreFiltersProps) {
  const hasActiveFilters = Boolean(
    search.trim() ||
      selectedLetter ||
      selectedCategory ||
      sort !== "manual" ||
      featured
  );

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-bold text-[var(--brand-navy)]">
          <SlidersHorizontal
            size={18}
            className="text-[var(--brand-purple)]"
          />
          Filter Stores
        </h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[var(--brand-purple)] transition-colors hover:text-[var(--accent-hover)]"
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 min-w-0">
        <label className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]">
          Search stores
        </label>

        <StoreSearch
          value={search}
          onChange={onSearchChange}
        />
      </div>

      {/* Category and Sorting */}
      <div className="grid grid-cols-1 gap-4">
        <StoreCategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          sort={sort}
          onSortChange={onSortChange}
        />

        {/* Featured Filter */}
        <div className="min-w-0">
          <label
            htmlFor="store-featured-filter"
            className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
          >
            Store type
          </label>

          <select
            id="store-featured-filter"
            value={featured}
            onChange={(event) =>
              onFeaturedChange(event.target.value)
            }
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
          >
            <option value="">All Stores</option>
            <option value="true">Featured Stores</option>
            <option value="false">Not Featured Stores</option>
          </select>
        </div>
      </div>

      {/* Alphabet Filter */}
      <div className="mt-5 border-t border-[var(--border)] pt-5">
        <p className="mb-3 text-sm font-semibold text-[var(--brand-navy)]">
          Browse stores alphabetically
        </p>

        <AlphabetFilter
          selectedLetter={selectedLetter}
          onLetterChange={onLetterChange}
        />
      </div>
    </div>
  );
}