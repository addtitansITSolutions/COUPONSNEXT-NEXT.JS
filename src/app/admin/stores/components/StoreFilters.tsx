// "use client";

// import { useEffect, useState } from "react";
// import { Search, X } from "lucide-react";

// import type { StoreFilters as StoreFiltersType } from "@/lib/hooks/useStores";

// interface Category {
//   id: string;
//   name: string;
//   slug: string;
// }

// interface StoreFiltersProps {
//   filters: StoreFiltersType;
//   onSearchChange: (value: string) => void;
//   onCategoryChange: (value: string) => void;
//   onIsActiveChange: (value: string) => void;
//   onIsFeaturedChange: (value: string) => void;
//   onCountryChange: (value: string) => void;
//   onClear: () => void;
// }

// export default function StoreFilters({
//   filters,
//   onSearchChange,
//   onCategoryChange,
//   onIsActiveChange,
//   onIsFeaturedChange,
//   onCountryChange,
//   onClear,
// }: StoreFiltersProps) {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(true);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         setCategoriesLoading(true);

//         const response = await fetch(
//           "/api/admin/categories?type=store&isActive=true&limit=100",
//           {
//             method: "GET",
//             credentials: "include",
//             cache: "no-store",
//           }
//         );

//         const data = await response.json();

//         if (!response.ok || !data.success) {
//           throw new Error(
//             data.message || "Failed to load categories"
//           );
//         }

//         setCategories(data.categories || []);
//       } catch (error) {
//         console.error("Failed to load store categories:", error);
//         setCategories([]);
//       } finally {
//         setCategoriesLoading(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const hasActiveFilters =
//     filters.search.trim() !== "" ||
//     filters.category !== "" ||
//     filters.isActive !== "" ||
//     filters.isFeatured !== "" ||
//     filters.country.trim() !== "";

//   return (
//     <div className="space-y-4">
//       {/* Search */}
//       <div className="relative">
//         <Search
//           size={18}
//           className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//         />

//         <input
//           type="text"
//           value={filters.search}
//           onChange={(event) => onSearchChange(event.target.value)}
//           placeholder="Search stores..."
//           className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
//         />
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
//         {/* Category */}
//         <select
//           value={filters.category}
//           onChange={(event) => onCategoryChange(event.target.value)}
//           disabled={categoriesLoading}
//           className="min-w-[180px] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
//         >
//           <option value="">
//             {categoriesLoading
//               ? "Loading categories..."
//               : "All categories"}
//           </option>

//           {categories.map((category) => (
//             <option key={category.id} value={category.id}>
//               {category.name}
//             </option>
//           ))}
//         </select>

//         {/* Active */}
//         <select
//           value={filters.isActive}
//           onChange={(event) => onIsActiveChange(event.target.value)}
//           className="min-w-[150px] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
//         >
//           <option value="">All status</option>
//           <option value="true">Active</option>
//           <option value="false">Inactive</option>
//         </select>

//         {/* Featured */}
//         <select
//           value={filters.isFeatured}
//           onChange={(event) =>
//             onIsFeaturedChange(event.target.value)
//           }
//           className="min-w-[150px] rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
//         >
//           <option value="">All stores</option>
//           <option value="true">Featured</option>
//           <option value="false">Not featured</option>
//         </select>

//         {/* Country */}
//         <input
//           type="text"
//           value={filters.country}
//           onChange={(event) =>
//             onCountryChange(event.target.value.toUpperCase())
//           }
//           maxLength={2}
//           placeholder="Country (IN)"
//           className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm uppercase text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 sm:w-[150px]"
//         />

//         {/* Clear */}
//         {hasActiveFilters && (
//           <button
//             type="button"
//             onClick={onClear}
//             className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
//           >
//             <X size={16} />
//             Clear filters
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import type { StoreFilters as StoreFiltersType } from "@/lib/hooks/useStores";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface StoreFiltersProps {
  filters: StoreFiltersType;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onIsActiveChange: (value: string) => void;
  onIsFeaturedChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onClear: () => void;
}

export default function StoreFilters({
  filters,
  onSearchChange,
  onCategoryChange,
  onIsActiveChange,
  onIsFeaturedChange,
  onCountryChange,
  onClear,
}: StoreFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [localCountry, setLocalCountry] = useState(filters.country || "");

  // Keep internal country state in sync if parent resets or clears
  useEffect(() => {
    setLocalCountry(filters.country || "");
  }, [filters.country]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        const response = await fetch(
          "/api/admin/categories?type=store&isActive=true&limit=100",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load categories"
          );
        }

        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to load store categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCountryInputChange = (value: string) => {
    const sanitized = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);
    setLocalCountry(sanitized);

    // Only fire upstream API filter if length is 2 or fully cleared back to 0
    if (sanitized.length === 2 || sanitized.length === 0) {
      onCountryChange(sanitized);
    }
  };

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.category !== "" ||
    filters.isActive !== "" ||
    filters.isFeatured !== "" ||
    filters.country.trim() !== "";

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      {/* Search Input - Expands to occupy available space on xl screens */}
      <div className="relative min-w-[240px] flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={filters.search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search stores..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10"
        />
      </div>

      {/* Filters Group - Wraps gracefully on mobile/tablet, single row alongside search on desktop */}
      <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(event) => onCategoryChange(event.target.value)}
          disabled={categoriesLoading}
          className="min-w-[160px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 xl:flex-initial"
        >
          <option value="">
            {categoriesLoading
              ? "Loading categories..."
              : "All categories"}
          </option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* Active Status */}
        <select
          value={filters.isActive}
          onChange={(event) => onIsActiveChange(event.target.value)}
          className="min-w-[130px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 xl:flex-initial"
        >
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* Featured */}
        <select
          value={filters.isFeatured}
          onChange={(event) => onIsFeaturedChange(event.target.value)}
          className="min-w-[130px] flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 xl:flex-initial"
        >
          <option value="">All stores</option>
          <option value="true">Featured</option>
          <option value="false">Not featured</option>
        </select>

        {/* Country Code (ISO - 2 characters) */}
        <input
          type="text"
          value={localCountry}
          onChange={(event) => handleCountryInputChange(event.target.value)}
          maxLength={2}
          placeholder="Country (IN)"
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-center text-sm uppercase tracking-wide text-gray-700 outline-none transition placeholder:normal-case placeholder:tracking-normal focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 sm:w-[130px] xl:w-[120px]"
        />

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
          >
            <X size={16} />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}