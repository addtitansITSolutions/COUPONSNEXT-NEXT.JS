
"use client";

import { Search, X } from "lucide-react";

import type { CouponFilters as CouponFiltersType } from "@/lib/hooks/useCoupons";
import StoreDropdown from "@/components/admin/coupons/StoreDropdown";
import CategoryDropdown from "@/components/admin/coupons/CategoryDropdown";

interface CouponFiltersProps {
  filters: CouponFiltersType;
  onSearchChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onIsFeaturedChange: (value: string) => void;
  onIsVerifiedChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onClear: () => void;
}

export default function CouponFilters({
  filters,
  onSearchChange,
  onStoreChange,
  onCategoryChange,
  onTypeChange,
  onStatusChange,
  onIsActiveChange,
  onIsFeaturedChange,
  onIsVerifiedChange,
  onCountryChange,
  onClear,
}: CouponFiltersProps) {
  const hasFilters =
    filters.search.trim() !== "" ||
    filters.store !== "" ||
    filters.category !== "" ||
    filters.type !== "" ||
    filters.status !== "" ||
    filters.isActive !== "" ||
    filters.isFeatured !== "" ||
    filters.isVerified !== "" ||
    filters.country.trim() !== "";

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
            value={filters.search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search coupons by title, code or slug..."
            aria-label="Search coupons"
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
        <StoreDropdown
          value={filters.store}
          onChange={onStoreChange}
        />

        <CategoryDropdown
          value={filters.category}
          onChange={onCategoryChange}
        />

        {/* Coupon type */}
        <select
          aria-label="Filter by coupon type"
          value={filters.type}
          onChange={(event) => onTypeChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">All types</option>
          <option value="code">Coupon codes</option>
          <option value="deal">Deals</option>
        </select>

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
          <option value="expired">Expired</option>
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

        {/* Verified */}
        <select
          aria-label="Filter by verification status"
          value={filters.isVerified}
          onChange={(event) => onIsVerifiedChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">Verified and unverified</option>
          <option value="true">Verified only</option>
          <option value="false">Unverified only</option>
        </select>

        {/* Country */}
        <input
          type="text"
          value={filters.country}
          onChange={(event) => onCountryChange(event.target.value)}
          placeholder="Country (e.g. US, IN, GB)"
          aria-label="Filter by country"
          className={inputClassName}
        />
      </div>
    </div>
  );
}
