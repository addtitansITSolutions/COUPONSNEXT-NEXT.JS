
"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { BannerFilters as BannerFiltersType } from "@/lib/hooks/useBanners";
import StoreDropdown from "@/components/admin/coupons/StoreDropdown";

interface BannerFiltersProps {
  filters: BannerFiltersType;
  onSearchChange: (value: string) => void;
  onStoreChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onClear: () => void;
}

export default function BannerFilters({
  filters,
  onSearchChange,
  onStoreChange,
  onIsActiveChange,
  onCountryChange,
  onClear,
}: BannerFiltersProps) {
  const [localCountry, setLocalCountry] = useState(
    filters.country || ""
  );

  // Keep the country input synchronized when filters are cleared.
  useEffect(() => {
    setLocalCountry(filters.country || "");
  }, [filters.country]);

  const handleCountryInputChange = (value: string) => {
    const sanitized = value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 2);

    setLocalCountry(sanitized);

    // Apply the API filter after entering a 2-letter code,
    // or immediately when clearing the input.
    if (sanitized.length === 2 || sanitized.length === 0) {
      onCountryChange(sanitized);
    }
  };

  const hasFilters =
    filters.search.trim() !== "" ||
    filters.store !== "" ||
    filters.isActive !== "" ||
    filters.country.trim() !== "";

  const inputClassName =
    "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10";

  const selectClassName =
    "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10";

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
            placeholder="Search banners by title or subtitle..."
            aria-label="Search banners"
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
        {/* Reuse the existing Coupons StoreDropdown */}
        <StoreDropdown
          value={filters.store}
          onChange={onStoreChange}
        />

        {/* Active status */}
        <select
          aria-label="Filter by banner active status"
          value={filters.isActive}
          onChange={(event) => onIsActiveChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">Active and inactive</option>
          <option value="true">Active only</option>
          <option value="false">Inactive only</option>
        </select>

        {/* Country */}
        <input
          type="text"
          value={localCountry}
          onChange={(event) =>
            handleCountryInputChange(event.target.value)
          }
          maxLength={2}
          placeholder="Country (e.g. US, IN)"
          aria-label="Filter banners by country"
          className={`${inputClassName} uppercase`}
        />
      </div>
    </div>
  );
}
