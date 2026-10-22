
"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import type { BlogFilters as BlogFiltersType } from "@/lib/hooks/useBlogs";
import CategoryDropdown from "@/components/admin/coupons/CategoryDropdown";
import UserDropdown from "@/components/admin/blog/UserDropdown";

interface BlogFiltersProps {
  filters: BlogFiltersType;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onIsFeaturedChange: (value: string) => void;
  onClear: () => void;
}

export default function BlogFilters({
  filters,
  onSearchChange,
  onCategoryChange,
  onAuthorChange,
  onStatusChange,
  onIsActiveChange,
  onIsFeaturedChange,
  onClear,
}: BlogFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || "");

  useEffect(() => {
    setLocalSearch(filters.search || "");
  }, [filters.search]);

  const hasFilters =
    filters.search.trim() !== "" ||
    filters.category !== "" ||
    filters.author !== "" ||
    filters.status !== "" ||
    filters.isActive !== "" ||
    filters.isFeatured !== "";

  const inputClassName =
    "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10";

  const selectClassName =
    "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <div className="space-y-4">
      {/* Search and clear */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            value={localSearch}
            onChange={(event) => {
              const value = event.target.value;
              setLocalSearch(value);
              onSearchChange(value);
            }}
            placeholder="Search blogs by title, slug or excerpt..."
            aria-label="Search blogs"
            className={`${inputClassName} pl-9`}
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <X size={15} />
            Clear filters
          </button>
        )}
      </div>

      {/* Filter controls */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Category */}
        <CategoryDropdown
          value={filters.category}
          onChange={onCategoryChange}
          contentType="blog"
        />

        <UserDropdown
          value={filters.author}
          onChange={onAuthorChange}
          role="admin"
        />

        {/* Publication status */}
        <select
          aria-label="Filter by publication status"
          value={filters.status}
          onChange={(event) => onStatusChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>

        {/* Active */}
        <select
          aria-label="Filter by active status"
          value={filters.isActive}
          onChange={(event) => onIsActiveChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">Active and inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>

        {/* Featured */}
        <select
          aria-label="Filter by featured status"
          value={filters.isFeatured}
          onChange={(event) => onIsFeaturedChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">Featured and regular</option>
          <option value="true">Featured only</option>
          <option value="false">Not featured</option>
        </select>
      </div>
    </div>
  );
}
