"use client";

import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

type CategoryFiltersProps = {
  search: string;
  contentType: string;
  status: string;
  featured: string;

  isDisabled: boolean;

  onSearchChange: (value: string) => void;
  onContentTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onFeaturedChange: (value: string) => void;

  onMobileFiltersClick?: () => void;
};

export default function CategoryFilters({
  search,
  contentType,
  status,
  featured,
  isDisabled,
  onSearchChange,
  onContentTypeChange,
  onStatusChange,
  onFeaturedChange,
  onMobileFiltersClick,
}: CategoryFiltersProps) {
  return (
    <div className="border-b border-[var(--border)] p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            strokeWidth={1.9}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-navy)]/40"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search categories..."
            disabled={isDisabled}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/35 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Content Type */}
        <select
          value={contentType}
          onChange={(event) =>
            onContentTypeChange(event.target.value)
          }
          disabled={isDisabled}
          className="h-11 rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            All Content Types
          </option>

          <option value="store">Store</option>
          <option value="coupon">Coupon</option>
          <option value="blog">Blog</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          disabled={isDisabled}
          className="h-11 rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            All Status
          </option>

          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Featured */}
        <select
          value={featured}
          onChange={(event) =>
            onFeaturedChange(event.target.value)
          }
          disabled={isDisabled}
          className="h-11 rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            All Categories
          </option>

          <option value="true">
            Featured
          </option>

          <option value="false">
            Not Featured
          </option>
        </select>

        {/* Mobile filter button */}
        <button
          type="button"
          onClick={onMobileFiltersClick}
          disabled={isDisabled}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--brand-navy)]/70 transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60 lg:hidden"
        >
          <SlidersHorizontal size={17} />

          Filters
        </button>
      </div>
    </div>
  );
}