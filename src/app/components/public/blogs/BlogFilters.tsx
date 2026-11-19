"use client";

import { useEffect, useId, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

import type { BlogCategory } from "./BlogsClient";

export interface BlogFiltersState {
  search: string;
  category: string;
  tag: string;
  isFeatured: string;
  sort: "default" | "latest" | "oldest" | "popular";
}

interface BlogFiltersProps {
  categories: BlogCategory[];
  filters: BlogFiltersState;

  search: string;
  onSearchChange: (value: string) => void;

  onCategoryChange: (value: string) => void;
  onTagChange: (value: string) => void;
  onFeaturedChange: (value: string) => void;
  onSortChange: (value: string) => void;

  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function BlogFilters({
  categories,
  filters,
  search,
  onSearchChange,
  onCategoryChange,
  onTagChange,
  onFeaturedChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}: BlogFiltersProps) {
  const id = useId();

  const [tagInput, setTagInput] = useState(filters.tag);

  // Sync local tag input with external filter changes
  useEffect(() => {
    setTagInput(filters.tag);
  }, [filters.tag]);

  // Debounce tag filtering
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tagInput !== filters.tag) {
        onTagChange(tagInput);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [tagInput, filters.tag, onTagChange]);

  return (
    <div
      className="
        h-full min-h-0 w-full
        overflow-y-auto overscroll-y-contain
        rounded-2xl border border-[var(--border)]
        bg-white p-5
        lg:h-fit lg:max-h-[calc(100vh-2rem)]
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-[var(--brand-navy)]">
          <SlidersHorizontal size={18} />
          Filters
        </h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-purple)] transition-colors hover:text-[var(--accent-hover)]"
          >
            <X size={13} />
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label
          htmlFor={`${id}-search`}
          className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
        >
          Search articles
        </label>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />

          <input
            id={`${id}-search`}
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search articles..."
            className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)]"
          />
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label
          htmlFor={`${id}-category`}
          className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
        >
          Category
        </label>

        <select
          id={`${id}-category`}
          value={filters.category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)]"
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tag */}
      <div className="mb-6">
        <label
          htmlFor={`${id}-tag`}
          className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
        >
          Search by Tag
        </label>

        <input
          id={`${id}-tag`}
          type="text"
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          placeholder="e.g. shopping, fashion..."
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)]"
        />

        <p className="mt-1.5 text-xs text-gray-400">
          Find articles using a specific tag.
        </p>
      </div>

      {/* Featured Articles */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-[var(--brand-navy)]">
          Featured Articles
        </p>

        <div className="space-y-3">
          {[
            { value: "", label: "All Articles" },
            { value: "true", label: "Featured Only" },
            { value: "false", label: "Not Featured" },
          ].map((option) => (
            <label
              key={option.value || "all"}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)] transition hover:text-[var(--brand-navy)]"
            >
              <input
                type="radio"
                name={`${id}-featured`}
                value={option.value}
                checked={filters.isFeatured === option.value}
                onChange={() => onFeaturedChange(option.value)}
                className="accent-[var(--brand-purple)]"
              />

              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Sorting */}
      <div>
        <label
          htmlFor={`${id}-sort`}
          className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
        >
          Sort By
        </label>

        <select
          id={`${id}-sort`}
          value={filters.sort}
          onChange={(event) => onSortChange(event.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)]"
        >
          <option value="default">Default</option>
          <option value="latest">Latest</option>
          <option value="popular">Most Popular</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
}
