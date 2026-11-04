"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Filter, X } from "lucide-react";

import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import StoresHero from "@/components/public/stores/StoresHero";
import StoreFilters from "@/components/public/stores/StoreFilters";
import StoreGrid from "@/components/public/stores/StoreGrid";
import StoresEmptyState from "@/components/public/stores/StoresEmptyState";
import StoresPagination from "@/components/public/stores/StoresPagination";

export interface StoreItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  storeBanner: string;
  websiteUrl: string;
  country: string;
  isFeatured: boolean;
  sortOrder: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
}

export interface StorePaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface StoresApiResponse {
  success: boolean;
  stores: StoreItem[];
  categories: StoreCategory[];
  pagination: StorePaginationData;
}

const PAGE_LIMIT = 20;

const INITIAL_PAGINATION: StorePaginationData = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export default function StoresClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  const [stores, setStores] = useState<StoreItem[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);

  const [pagination, setPagination] =
    useState<StorePaginationData>(INITIAL_PAGINATION);

  const [search, setSearch] = useState(
    searchParams.get("search") ?? ""
  );

  const [letter, setLetter] = useState(
    searchParams.get("letter") ?? ""
  );

  const [category, setCategory] = useState(
    searchParams.get("category") ?? ""
  );

  const [sort, setSort] = useState(
    searchParams.get("sort") === "alphabetical"
      ? "alphabetical"
      : "manual"
  );

  // Featured filter: "" = all, "true" = featured, "false" = not featured.
  const [featured, setFeatured] = useState(
    searchParams.get("featured") ?? ""
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const requestIdRef = useRef(0);

  // Fetch stores from the public API.
  const fetchStores = useCallback(async (query: string) => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams(query);

      params.set("limit", String(PAGE_LIMIT));

      const response = await fetch(
        `/api/public/stores?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result = (await response.json()) as StoresApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          "Unable to load stores. Please try again."
        );
      }

      // Ignore outdated requests.
      if (requestId !== requestIdRef.current) return;

      setStores(result.stores ?? []);
      setCategories(result.categories ?? []);
      setPagination(result.pagination ?? INITIAL_PAGINATION);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading stores."
      );

      setStores([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Synchronize filters with URL and fetch stores.
  // Supports browser Back and Forward navigation.
  useEffect(() => {
    const params = new URLSearchParams(queryString);

    setSearch(params.get("search") ?? "");
    setLetter(params.get("letter") ?? "");
    setCategory(params.get("category") ?? "");

    setSort(
      params.get("sort") === "alphabetical"
        ? "alphabetical"
        : "manual"
    );

    setFeatured(params.get("featured") ?? "");

    fetchStores(queryString);
  }, [queryString, fetchStores]);

  // Update URL while preserving other active filters.
  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(queryString);

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset pagination whenever filters change.
      params.delete("page");
      params.delete("limit");

      const query = params.toString();

      router.push(
        query ? `${pathname}?${query}` : pathname,
        { scroll: false }
      );
    },
    [pathname, queryString, router]
  );

  // Debounced search.
  useEffect(() => {
    const currentSearch =
      new URLSearchParams(queryString).get("search") ?? "";

    if (search.trim() === currentSearch) return;

    const timeout = window.setTimeout(() => {
      updateFilters({
        search: search.trim(),
      });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [search, queryString, updateFilters]);

  // Filter handlers.
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleLetterChange = (value: string) => {
    updateFilters({ letter: value });
  };

  const handleCategoryChange = (value: string) => {
    updateFilters({ category: value });
  };

  const handleSortChange = (value: string) => {
    updateFilters({
      sort: value === "alphabetical" ? value : "",
    });
  };

  const handleFeaturedChange = (value: string) => {
    updateFilters({ featured: value });
  };

  // Change page without losing active filters.
  const handlePageChange = (page: number) => {
    if (
      page < 1 ||
      page > pagination.totalPages ||
      page === pagination.page
    ) {
      return;
    }

    const params = new URLSearchParams(queryString);

    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }

    const query = params.toString();

    router.push(
      query ? `${pathname}?${query}` : pathname,
      { scroll: true }
    );
  };

  // Clear all filters.
  const handleClearFilters = () => {
    setSearch("");
    router.push(pathname, { scroll: false });
  };

  // Retry API request.
  const handleRetry = () => {
    fetchStores(queryString);
  };

  // Active filter indicator.
  const hasActiveFilters = Boolean(
    search.trim() ||
      letter ||
      category ||
      sort !== "manual" ||
      featured
  );

  // Close mobile drawer using Escape.
  useEffect(() => {
    if (!showMobileFilters) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMobileFilters(false);
      }
    };

    // Prevent background scrolling while drawer is open.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showMobileFilters]);

  return (
    <section aria-label="Store directory">
      {/* Hero */}
      <StoresHero />

      {/* Store directory */}
      <div className="bg-white py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Filters + Store Results */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">

            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-[136px] max-h-[calc(100vh-152px)] overflow-y-auto pr-1 [scrollbar-width:thin] min-h-[890px]">
                <StoreFilters
                  search={search}
                  onSearchChange={handleSearchChange}
                  selectedLetter={letter}
                  onLetterChange={handleLetterChange}
                  categories={categories}
                  selectedCategory={category}
                  onCategoryChange={handleCategoryChange}
                  sort={sort}
                  onSortChange={handleSortChange}
                  featured={featured}
                  onFeaturedChange={handleFeaturedChange}
                  onClear={handleClearFilters}
                />
              </div>
            </aside>

            {/* Store Results */}
            <div className="min-w-0">

              {/* Mobile Filter Button */}
              <div className="mb-5 flex gap-3 lg:hidden">
                <button
                  type="button"
                  onClick={() => setShowMobileFilters(true)}
                  aria-label="Open store filters"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-sm font-bold text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)]"
                >
                  <Filter
                    size={18}
                    className="text-[var(--brand-purple)]"
                  />

                  Filters

                  {hasActiveFilters && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-purple)] px-1.5 text-[10px] font-bold text-white">
                      !
                    </span>
                  )}
                </button>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex items-center justify-center rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--brand-purple)] transition hover:bg-[var(--accent-light)]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Results Heading */}
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-[var(--muted)]">
                  {loading ? (
                    "Loading stores..."
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-bold text-[var(--brand-navy)]">
                        {stores.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-[var(--brand-navy)]">
                        {pagination.total}
                      </span>{" "}
                      stores
                    </>
                  )}
                </p>
              </div>

              {/* Loading, Error and Empty States */}
              <div
                className="min-h-[240px]"
                aria-live="polite"
                aria-busy={loading}
              >
                {error ? (
                  <StoresEmptyState
                    title="Unable to load stores"
                    description={error}
                    actionLabel="Try again"
                    onAction={handleRetry}
                  />
                ) : stores.length === 0 && !loading ? (
                  <StoresEmptyState
                    title="No stores found"
                    description="We couldn't find any stores matching your search or filters. Try changing your selection."
                    actionLabel="Clear filters"
                    onAction={handleClearFilters}
                  />
                ) : (
                  <StoreGrid
                    stores={stores}
                    loading={loading}
                  />
                )}
              </div>

              {/* Pagination */}
              {!error && pagination.totalPages > 1 && (
                <div className="mt-9 sm:mt-12">
                  <StoresPagination
                    pagination={pagination}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[1000] lg:hidden">

          {/* Overlay */}
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setShowMobileFilters(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          {/* Drawer */}
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-y-0 left-0 flex w-[88%] max-w-[380px] flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-300"
          >
            {/* Drawer Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <h2
                  id="mobile-filter-title"
                  className="text-lg font-extrabold text-[var(--brand-navy)]"
                >
                  Filter Stores
                </h2>

                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Find your favorite stores
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
                className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
              >
                <X size={21} />
              </button>
            </div>

            {/* Filter Content */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <StoreFilters
                search={search}
                onSearchChange={handleSearchChange}
                selectedLetter={letter}
                onLetterChange={handleLetterChange}
                categories={categories}
                selectedCategory={category}
                onCategoryChange={handleCategoryChange}
                sort={sort}
                onSortChange={handleSortChange}
                featured={featured}
                onFeaturedChange={handleFeaturedChange}
                onClear={handleClearFilters}
              />
            </div>

            {/* Drawer Footer */}
            <div className="flex shrink-0 gap-3 border-t border-[var(--border)] bg-white p-4">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--brand-navy)] transition hover:bg-gray-50"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 rounded-xl bg-[var(--brand-purple)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
              >
                Done
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}