
"use client";

import { ChevronDown, ListFilter } from "lucide-react";

interface StoreCategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface StoreCategoryFilterProps {
  categories: StoreCategoryOption[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
}

export default function StoreCategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  sort,
  onSortChange,
}: StoreCategoryFilterProps) {
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
      {/* Category Filter */}
      <div className="relative w-full sm:w-56">
        <label
          htmlFor="store-category"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Category
        </label>

        <div className="relative">
          <select
            id="store-category"
            value={selectedCategory}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Sort Filter */}
      <div className="relative w-full sm:w-52">
        <label
          htmlFor="store-sort"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
        >
          Sort Stores
        </label>

        <div className="relative">
          <ListFilter
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <select
            id="store-sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
          >
            <option value="manual">Default Order</option>
            <option value="alphabetical">Alphabetical (A–Z)</option>
          </select>

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
