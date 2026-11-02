"use client";
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

export interface CouponFilterCategory {
  id: string;
  name: string;
  slug: string;
}

export interface CouponFilterCountry {
  code: string;
  name: string;
}

export interface CouponFiltersState {
  search: string;
  category: string;
  type: string;
  isVerified: string;
  isFeatured: string;
  country: string;
  sort: "popular" | "latest" | "oldest";
}

interface CouponFiltersProps {
  categories: CouponFilterCategory[];
  countries: CouponFilterCountry[];
  filters: CouponFiltersState;
  onFilterChange: <K extends keyof CouponFiltersState>(
    key: K,
    value: CouponFiltersState[K]
  ) => void;
  onClear: () => void;
}

export default function CouponFilters({ categories, countries, filters, onFilterChange, onClear, }: CouponFiltersProps) {
    const [searchValue, setSearchValue] = useState(filters.search);

    useEffect(() => {
    setSearchValue(filters.search);
    }, [filters.search]);

    useEffect(() => {
    const timer = setTimeout(() => {
        if (searchValue !== filters.search) {
        onFilterChange("search", searchValue);
        }
    },400);

    return () => clearTimeout(timer);
    }, [searchValue, filters.search, onFilterChange]);


  const hasActiveFilters =
    filters.search !== "" ||
    filters.category !== "" ||
    filters.type !== "" ||
    filters.isVerified !== "" ||
    filters.isFeatured !== "" ||
    filters.country !== "" ||
    filters.sort !== "popular";

  return (
    <aside className="h-fit rounded-2xl border border-[var(--border)] bg-white p-5">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-[var(--brand-navy)]">
          <SlidersHorizontal size={18} />
          Filters
        </h3>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
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
          htmlFor="coupon-search"
          className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
        >
          Search coupons
        </label>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          />

          <input
            id="coupon-search"
            type="search"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search offers..."
            className="w-full rounded-lg border border-[var(--border)] bg-white py-2.5 pl-9 pr-3 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)]"
           />
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label
          htmlFor="coupon-category"
          className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
        >
          Category
        </label>

        <select
          id="coupon-category"
          value={filters.category}
          onChange={(event) =>
            onFilterChange("category", event.target.value)
          }
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--brand-navy)] outline-none focus:border-[var(--brand-purple)]"
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Coupon Type */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-[var(--brand-navy)]">
          Coupon Type
        </p>

        <div className="space-y-3">
          {[
            { value: "", label: "All Types" },
            { value: "code", label: "Coupon Codes" },
            { value: "deal", label: "Deals" },
          ].map((option) => (
            <label
              key={option.value || "all"}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)]"
            >
              <input
                type="radio"
                name="coupon-type"
                value={option.value}
                checked={filters.type === option.value}
                onChange={() => onFilterChange("type", option.value)}
                className="accent-[var(--brand-purple)]"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Verification */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-[var(--brand-navy)]">
          Verification
        </p>

        <div className="space-y-3">
          {[
            { value: "", label: "All Coupons" },
            { value: "true", label: "Verified Only" },
            { value: "false", label: "Not Verified" },
          ].map((option, index) => (
            <label
              key={option.value || "all"}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)]"
            >
              <input
                type="radio"
                name="coupon-verified"
                value={option.value}
                checked={filters.isVerified === option.value}
                onChange={() =>
                  onFilterChange("isVerified", option.value)
                }
                className="accent-[var(--brand-purple)]"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {/* Featured Coupons */}
      <div className="mb-6">
    <p className="mb-3 text-sm font-semibold text-[var(--brand-navy)]">
        Featured Coupons
    </p>

    <div className="space-y-3">
        {[
        { value: "", label: "All Coupons" },
        { value: "true", label: "Featured Only" },
        { value: "false", label: "Not Featured" },
        ].map((option) => (
        <label
            key={option.value || "all"}
            className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted)]"
        >
            <input
            type="radio"
            name="coupon-featured"
            value={option.value}
            checked={filters.isFeatured === option.value}
            onChange={() =>
                onFilterChange("isFeatured", option.value)
            }
            className="accent-[var(--brand-purple)]"
            />
            {option.label}
        </label>
        ))}
    </div>
      </div>

      {/* Country */}
      <div className="mb-6">
        <label
          htmlFor="coupon-country"
          className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
        >
          Country
        </label>

        <select
          id="coupon-country"
          value={filters.country}
          onChange={(event) =>
            onFilterChange("country", event.target.value)
          }
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--brand-navy)] outline-none focus:border-[var(--brand-purple)]"
        >
          <option value="">All Countries</option>

          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sorting */}
      <div>
        <label
          htmlFor="coupon-sort"
          className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
        >
          Sort By
        </label>

        <select
          id="coupon-sort"
          value={filters.sort}
          onChange={(event) =>
            onFilterChange(
              "sort",
              event.target.value as CouponFiltersState["sort"]
            )
          }
          className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--brand-navy)] outline-none focus:border-[var(--brand-purple)]"
        >
          <option value="popular">Popular</option>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </aside>
  );
}
