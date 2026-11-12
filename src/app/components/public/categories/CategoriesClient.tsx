
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

import CategoryGrid from "@/components/public/categories/CategoryGrid";
import type { CategoryItem } from "@/components/public/categories/CategoryCard";
import CategorySidebar from "@/components/public/categories/CategorySidebar";

interface CategoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CategoriesApiResponse {
  success: boolean;
  categories: CategoryItem[];
  availableLetters: string[];
  pagination: CategoryPagination;
}

interface CategoryFiltersPanelProps {
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedLetter: string;
  availableLetters: string[];
  onLetterChange: (letter: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onClose?: () => void;
  mobile?: boolean;
}

const LIMIT = 24;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/* ---------- category filters panel ---------- */

function CategoryFiltersPanel({
  searchInput,
  onSearchChange,
  selectedLetter,
  availableLetters,
  onLetterChange,
  hasActiveFilters,
  onClearFilters,
  onClose,
  mobile = false,
}: CategoryFiltersPanelProps) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] p-5">
        <div>
          <h3 className="text-base font-bold text-[var(--brand-navy)]">
            Find Categories
          </h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Discover your favorite shopping categories.
          </p>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <X size={19} />
          </button>
        )}
      </div>

      <div className="space-y-6 p-5">
        {/* Search */}
        <div>
          <label
            htmlFor={mobile ? "mobile-category-search" : "category-search"}
            className="mb-2 block text-sm font-bold text-[var(--brand-navy)]"
          >
            Search Categories
          </label>

          <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 transition focus-within:border-[var(--brand-purple)] focus-within:ring-2 focus-within:ring-[var(--brand-purple)]/10">
            <Search size={17} className="shrink-0 text-[var(--muted)]" />

            <input
              id={mobile ? "mobile-category-search" : "category-search"}
              type="search"
              value={searchInput}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search categories..."
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[var(--brand-navy)] outline-none placeholder:text-gray-400"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                aria-label="Clear search"
                className="shrink-0 text-[var(--muted)] transition hover:text-[var(--brand-purple)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Alphabet filter */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-[var(--brand-navy)]">
              Browse by Letter
            </h4>

            {selectedLetter && (
              <button
                type="button"
                onClick={() => onLetterChange("")}
                className="text-xs font-semibold text-[var(--brand-purple)] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => onLetterChange("")}
              aria-pressed={!selectedLetter}
              className={`col-span-6 rounded-lg px-3 py-2 text-xs font-bold transition ${
                !selectedLetter
                  ? "bg-[var(--brand-purple)] text-white"
                  : "border border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)]"
              }`}
            >
              All Categories
            </button>

            {ALPHABET.map((letter) => {
              const isAvailable = availableLetters.includes(letter);
              const isSelected = selectedLetter === letter;

              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => onLetterChange(letter)}
                  aria-pressed={isSelected}
                  className={`flex aspect-square items-center justify-center rounded-lg text-xs font-bold transition ${
                    isSelected
                      ? "bg-[var(--brand-purple)] text-white"
                      : isAvailable
                        ? "border border-[var(--border)] bg-white text-[var(--brand-navy)] hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
                        : "cursor-not-allowed border border-gray-100 bg-gray-50 text-gray-300"
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
            Select a letter to browse categories alphabetically.
          </p>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--brand-purple)] transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)]"
          >
            <RotateCcw size={15} />
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- categories client ---------- */

export default function CategoriesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();

  const filters = useMemo(() => {
    const params = new URLSearchParams(queryString);

    return {
      search: params.get("search") ?? "",
      letter: params.get("letter") ?? "",
      sort: params.get("sort") ?? "manual",
      featured: params.get("featured") ?? "",
    };
  }, [queryString]);

  const [searchInput, setSearchInput] = useState(filters.search);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [pagination, setPagination] =
    useState<CategoryPagination | null>(null);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const loadMoreControllerRef = useRef<AbortController | null>(null);

  // Keep search input synchronized with browser navigation.
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Prevent background scrolling while the mobile drawer is open.
  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileFiltersOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileFiltersOpen]);

  // Update URL parameters without losing other filters.
  const updateUrlParameter = useCallback(
    (key: string, value: string, replace = true) => {
      const params = new URLSearchParams(queryString);

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      params.delete("page");
      params.delete("limit");

      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;

      if (replace) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }
    },
    [pathname, queryString, router]
  );

  // Debounced search.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput.trim() !== filters.search) {
        updateUrlParameter("search", searchInput.trim());
      }
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchInput, filters.search, updateUrlParameter]);

  // Fetch categories whenever URL filters change.
  useEffect(() => {
    const controller = new AbortController();

    loadMoreControllerRef.current?.abort();

    setLoading(true);
    setLoadingMore(false);
    setError("");
    setCategories([]);
    setPagination(null);

    const fetchCategories = async () => {
      try {
        const params = new URLSearchParams(queryString);

        params.set("page", "1");
        params.set("limit", String(LIMIT));
        params.set("contentType", "coupon");

        const response = await fetch(
          `/api/public/categories?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data: CategoriesApiResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Unable to load categories.");
        }

        setCategories(data.categories);
        setPagination(data.pagination);
        setAvailableLetters(data.availableLetters ?? []);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading categories."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      controller.abort();
    };
  }, [queryString, retryKey]);

  // Load the next page and append categories.
  const handleLoadMore = async () => {
    if (!pagination?.hasNextPage || loadingMore) return;

    loadMoreControllerRef.current?.abort();

    const controller = new AbortController();
    loadMoreControllerRef.current = controller;

    setLoadingMore(true);
    setError("");

    try {
      const params = new URLSearchParams(queryString);

      params.set("page", String(pagination.page + 1));
      params.set("limit", String(LIMIT));
      params.set("contentType", "coupon");

      const response = await fetch(
        `/api/public/categories?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        }
      );

      const data: CategoriesApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Unable to load more categories.");
      }

      setCategories((previous) => {
        const existingIds = new Set(previous.map((category) => category.id));

        const newCategories = data.categories.filter(
          (category) => !existingIds.has(category.id)
        );

        return [...previous, ...newCategories];
      });

      setPagination(data.pagination);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading more categories."
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoadingMore(false);
      }
    }
  };

  const handleLetterChange = (letter: string) => {
    updateUrlParameter("letter", letter, false);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.letter || filters.featured
  );

  const filterPanelProps: CategoryFiltersPanelProps = {
    searchInput,
    onSearchChange: setSearchInput,
    selectedLetter: filters.letter,
    availableLetters,
    onLetterChange: handleLetterChange,
    hasActiveFilters,
    onClearFilters: handleClearFilters,
  };

  return (
    <section className="bg-white">
        <style>
            {`
        @keyframes categoryDrawerIn {
            from {
            transform: translateX(-100%);
            }
            to {
            transform: translateX(0);
            }
        }

        @keyframes categoryBackdropIn {
            from {
            opacity: 0;
            }
            to {
            opacity: 1;
            }
        }

        .category-drawer-enter {
            animation: categoryDrawerIn 250ms ease-out both;
        }

        .category-backdrop-enter {
            animation: categoryBackdropIn 250ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
            .category-drawer-enter,
            .category-backdrop-enter {
            animation: none;
            }
        }
        `}
        </style>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Section heading */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-purple)]">
            Discover & Save
          </span>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
                Explore Shopping Categories
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
                Browse categories to find the latest coupons, discounts, and
                offers for your favorite products.
              </p>
            </div>

            {/* Mobile filter button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="mobile-category-filters"
              className="inline-flex w-fit shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--accent-hover)] lg:hidden"
            >
              <SlidersHorizontal size={17} />
              Filters
              {hasActiveFilters && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-yellow)] px-1 text-[10px] font-extrabold text-[var(--brand-navy)]">
                  !
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
          {/* Categories */}
          <div className="min-w-0">
            {/* Results count */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-[var(--brand-navy)]">
                {filters.letter
                  ? `Categories starting with ${filters.letter}`
                  : "All Categories"}
              </h3>

              {!loading && pagination && (
                <span className="shrink-0 text-xs font-medium text-[var(--muted)] sm:text-sm">
                  {pagination.total}{" "}
                  {pagination.total === 1 ? "category" : "categories"}
                </span>
              )}
            </div>

            {/* Initial loading */}
            {loading && (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-2xl border border-[var(--border)] p-4"
                  >
                    <div className="mb-4 aspect-[16/10] rounded-xl bg-gray-100" />
                    <div className="h-4 w-3/4 rounded bg-gray-100" />
                    <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!loading && error && categories.length === 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                <AlertCircle size={30} className="mx-auto text-red-500" />

                <h3 className="mt-3 font-bold text-[var(--brand-navy)]">
                  Unable to load categories
                </h3>

                <p className="mt-2 text-sm text-gray-600">{error}</p>

                <button
                  type="button"
                  onClick={() => setRetryKey((previous) => previous + 1)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
                >
                  <RefreshCw size={16} />
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && categories.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[#faf9fc] px-5 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--brand-purple)]">
                  <Search size={25} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-[var(--brand-navy)]">
                  No categories found
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">
                  We couldn't find any categories matching your search.
                  Try another search or browse all categories.
                </p>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-5 rounded-xl bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
                >
                  View all categories
                </button>
              </div>
            )}

            {/* Category grid */}
            {!loading && categories.length > 0 && (
              <>
                <CategoryGrid categories={categories} />

                {error && (
                  <p className="mt-4 text-center text-sm text-red-600">
                    {error}
                  </p>
                )}

                {/* Load more */}
                {pagination?.hasNextPage && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl border border-[var(--brand-purple)] bg-white px-6 py-3 text-sm font-bold text-[var(--brand-purple)] transition hover:bg-[var(--accent-light)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        {/* Desktop sidebar */}
        <aside className="sticky top-[136px] hidden min-w-0 lg:block">
        <CategoryFiltersPanel {...filterPanelProps} />

        {/* Money-saving sidebar */}
        <div className="mt-6">
            <CategorySidebar />
        </div>
        </aside>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div
            id="mobile-category-filters"
            className="fixed inset-0 z-[1100] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Category filters"
        >
            {/* Backdrop */}
            <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="category-backdrop-enter absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            {/* Left drawer */}
            <div className="category-drawer-enter absolute inset-y-0 left-0 flex w-full max-w-[300px] flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="border-b border-[var(--border)] px-5 py-4">
                <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-extrabold text-[var(--brand-navy)]">
                    Category Filters
                    </h2>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                    Find exactly what you're looking for.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200"
                >
                    <X size={19} />
                </button>
                </div>
            </div>

            <div className="flex-1 p-4">
                <CategoryFiltersPanel
                {...filterPanelProps}
                mobile
                onClose={() => setMobileFiltersOpen(false)}
                />
            </div>

            <div className="border-t border-[var(--border)] bg-white p-4">
                <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full rounded-xl bg-[var(--brand-purple)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
                >
                View Categories
                </button>
            </div>
            </div>
        </div>
       )}
    </section>
  );
}
