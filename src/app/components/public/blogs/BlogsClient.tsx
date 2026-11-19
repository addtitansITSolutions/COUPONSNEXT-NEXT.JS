
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

import BlogFilters, {
  type BlogFiltersState,
} from "@/components/public/blogs/BlogFilters";
import BlogGrid from "@/components/public/blogs/BlogGrid";
import BlogLoading from "@/components/public/blogs/BlogLoading";
import BlogEmptyState from "@/components/public/blogs/BlogEmptyState";
import BlogLoadMore from "@/components/public/blogs/BlogLoadMore";
import BlogErrorState from "@/components/public/blogs/BlogErrorState";

/* ---------- types ---------- */

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
}

export interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: BlogAuthor;
  category?: BlogCategory;
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
}

interface BlogsClientProps {
  categories: BlogCategory[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

interface BlogsApiResponse {
  success: boolean;
  blogs: BlogItem[];
  pagination: Pagination;
  message?: string;
  error?: string;
}

/* ---------- constants ---------- */

const INITIAL_FILTERS: BlogFiltersState = {
  search: "",
  category: "",
  tag: "",
  isFeatured: "",
  sort: "default",
};

const PAGE_LIMIT = 12;
const SEARCH_DEBOUNCE = 300;

/* ---------- helpers ---------- */

function getFiltersFromUrl(
  searchParams: ReturnType<typeof useSearchParams>
): BlogFiltersState {
  const sort = searchParams.get("sort");

  return {
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    tag: searchParams.get("tag") || "",
    isFeatured: searchParams.get("isFeatured") || "",
    sort:
        sort === "default" ||
        sort === "latest" ||
        sort === "oldest" ||
        sort === "popular"
          ? sort
          : "default",
  };
}

function hasActiveFilters(filters: BlogFiltersState) {
  return (
    filters.search !== "" ||
    filters.category !== "" ||
    filters.tag !== "" ||
    filters.isFeatured !== "" ||
    filters.sort !== INITIAL_FILTERS.sort
  );
}

/* ---------- component ---------- */

export default function BlogsClient({
  categories,
}: BlogsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ---------- URL filters ---------- */

  const filters = useMemo(
    () => getFiltersFromUrl(searchParams),
    [searchParams]
  );

  const [searchInput, setSearchInput] = useState(filters.search);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilters = hasActiveFilters(filters);

  /* ---------- blog data ---------- */

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const [hasMore, setHasMore] = useState(false);

  /* ---------- refs ---------- */

  const observerRef = useRef<HTMLDivElement | null>(null);

  const initialControllerRef = useRef<AbortController | null>(null);
  const loadMoreControllerRef = useRef<AbortController | null>(null);

  const loadingMoreRef = useRef(false);
  const currentPageRef = useRef(1);

  /* ---------- query string ---------- */

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    params.set("page", "1");
    params.set("limit", String(PAGE_LIMIT));

    if (filters.search.trim()) {
      params.set("search", filters.search.trim());
    }

    if (filters.category) {
      params.set("category", filters.category);
    }

    if (filters.tag) {
      params.set("tag", filters.tag);
    }

    if (filters.isFeatured) {
      params.set("isFeatured", filters.isFeatured);
    }

    if (filters.sort !== "default") {
      params.set("sort", filters.sort);
    }

    return params.toString();
  }, [filters]);

  /* ---------- update URL ---------- */

  const updateFilter = useCallback(
    (
      key: keyof BlogFiltersState,
      value: string,
      replace = false
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!value || (key === "sort" && value === "default")) {
        params.delete(key);
      } else {
        params.set(key, value);
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
    [pathname, router, searchParams]
  );

  /* ---------- search input sync ---------- */

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (searchInput === filters.search) return;

    const timeout = window.setTimeout(() => {
      updateFilter("search", searchInput, true);
    }, SEARCH_DEBOUNCE);

    return () => window.clearTimeout(timeout);
  }, [searchInput, filters.search, updateFilter]);

  /* ---------- initial blog fetch ---------- */

  const fetchBlogs = useCallback(async () => {
    initialControllerRef.current?.abort();
    loadMoreControllerRef.current?.abort();

    loadingMoreRef.current = false;
    currentPageRef.current = 1;

    const controller = new AbortController();
    initialControllerRef.current = controller;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setLoadMoreError(null);
    setBlogs([]);
    setTotalBlogs(0);
    setHasMore(false);

    try {
      const response = await fetch(
        `/api/public/blogs?${queryString}`,
        {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        }
      );

      const data: BlogsApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Unable to load blogs."
        );
      }

      const blogItems = Array.isArray(data.blogs) ? data.blogs : [];

      setBlogs(blogItems);
      setTotalBlogs(data.pagination?.total ?? blogItems.length);

      const page = data.pagination?.page ?? 1;
      const totalPages = data.pagination?.totalPages ?? 1;

      currentPageRef.current = page;
      setHasMore(
        data.pagination?.hasNextPage ?? page < totalPages
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading blogs."
      );
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, [queryString]);

  useEffect(() => {
    fetchBlogs();

    return () => {
      initialControllerRef.current?.abort();
    };
  }, [fetchBlogs]);

  /* ---------- load more blogs ---------- */

  const loadMoreBlogs = useCallback(async () => {
    if (
      loadingMoreRef.current ||
      !hasMore ||
      loading ||
      error
    ) {
      return;
    }

    loadingMoreRef.current = true;

    const nextPage = currentPageRef.current + 1;
    const controller = new AbortController();

    loadMoreControllerRef.current?.abort();
    loadMoreControllerRef.current = controller;

    setLoadingMore(true);
    setLoadMoreError(null);

    try {
      const params = new URLSearchParams(queryString);
      params.set("page", String(nextPage));

      const response = await fetch(
        `/api/public/blogs?${params.toString()}`,
        {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        }
      );

      const data: BlogsApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Unable to load more blogs."
        );
      }

      const newBlogs = Array.isArray(data.blogs) ? data.blogs : [];

      setBlogs((previous) => {
        const existingIds = new Set(
          previous.map((blog) => blog.id)
        );

        const uniqueBlogs = newBlogs.filter(
          (blog) => !existingIds.has(blog.id)
        );

        return [...previous, ...uniqueBlogs];
      });

      const page = data.pagination?.page ?? nextPage;
      const totalPages = data.pagination?.totalPages ?? page;

      currentPageRef.current = page;

      setHasMore(
        data.pagination?.hasNextPage ?? page < totalPages
      );

      if (typeof data.pagination?.total === "number") {
        setTotalBlogs(data.pagination.total);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setLoadMoreError(
        err instanceof Error
          ? err.message
          : "Unable to load more blogs."
      );
    } finally {
      if (!controller.signal.aborted) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [queryString, hasMore, loading, error]);

  /* ---------- infinite scroll ---------- */

  useEffect(() => {
    const target = observerRef.current;

    if (
      !target ||
      !hasMore ||
      loading ||
      loadingMore ||
      error ||
      loadMoreError
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting) {
          loadMoreBlogs();
        }
      },
      {
        root: null,
        rootMargin: "350px",
        threshold: 0,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [
    hasMore,
    loading,
    loadingMore,
    error,
    loadMoreError,
    loadMoreBlogs,
  ]);

  /* ---------- filter actions ---------- */

  const clearFilters = useCallback(() => {
    setSearchInput("");
    router.push(pathname, { scroll: false });
    setMobileFiltersOpen(false);
  }, [pathname, router]);

  const handleCategoryChange = useCallback(
    (value: string) => updateFilter("category", value),
    [updateFilter]
  );

  const handleTagChange = useCallback(
    (value: string) => updateFilter("tag", value),
    [updateFilter]
  );

  const handleFeaturedChange = useCallback(
    (value: string) => updateFilter("isFeatured", value),
    [updateFilter]
  );

  const handleSortChange = useCallback(
    (value: string) => updateFilter("sort", value),
    [updateFilter]
  );

  const filtersProps = {
    categories,
    filters,
    search: searchInput,
    onSearchChange: setSearchInput,
    onCategoryChange: handleCategoryChange,
    onTagChange: handleTagChange,
    onFeaturedChange: handleFeaturedChange,
    onSortChange: handleSortChange,
    onClearFilters: clearFilters,
    hasActiveFilters: activeFilters,
  };

  /* ---------- render ---------- */

  return (
    <section className="relative bg-white pb-20 pt-8 sm:pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--brand-purple)]/15 bg-[var(--brand-purple)]/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--brand-purple)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand-yellow)]" />
              The CouponsNext Journal
            </span> */}

            <h2 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
              Latest Articles & Insights
            </h2>
          </div>

          {/* Mobile filter button */}
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-navy)] shadow-sm transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] sm:w-auto lg:hidden"
          >
            <Filter size={16} />
            {activeFilters ? "Filters Applied" : "Filters"}
          </button>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">

          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <BlogFilters {...filtersProps} />
            </div>
          </aside>

          {/* Blog results */}
          <div className="min-w-0">

            {/* Results toolbar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <p className="text-sm text-gray-500">
                {loading ? (
                  "Finding articles..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-[var(--brand-navy)]">
                      {blogs.length}
                    </span>
                    {" "}of{" "}
                    <span className="font-semibold text-[var(--brand-navy)]">
                      {totalBlogs}
                    </span>
                    {" "}articles
                  </>
                )}
              </p>

              {activeFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-semibold text-[var(--brand-purple)] transition hover:text-[var(--accent-hover)]"
                >
                  Clear filters
                </button>
              )}
            </div>

            {/* Initial loading */}
            {loading && <BlogLoading />}

            {/* Initial error */}
            {!loading && error && (
              <BlogErrorState
                message={error}
                onRetry={fetchBlogs}
              />
            )}

            {/* Empty state */}
            {!loading && !error && blogs.length === 0 && (
              <BlogEmptyState onClearFilters={clearFilters} />
            )}

            {/* Blog grid */}
            {!loading && !error && blogs.length > 0 && (
              <>
                <BlogGrid blogs={blogs} />

                {/* Infinite scroll trigger */}
                {hasMore && (
                  <div
                    ref={observerRef}
                    className="h-10"
                    aria-hidden="true"
                  />
                )}

                {/* Load more status */}
                {(loadingMore || loadMoreError) && (
                  <BlogLoadMore
                    loading={loadingMore}
                    error={loadMoreError}
                    onRetry={loadMoreBlogs}
                  />
                )}

                {/* End of articles */}
                {!hasMore && !loadingMore && !loadMoreError && (
                  <div className="mt-12 text-center">
                    <p className="text-sm text-gray-400">
                      You’ve reached the end of the articles.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
          />

          <div className="absolute bottom-0 left-0 top-0 flex w-[min(88%,380px)] flex-col overflow-hidden bg-white shadow-2xl">

            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--brand-navy)]">
                  Filters
                </h3>
                <p className="mt-0.5 text-xs text-gray-500">
                  Find articles that interest you
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-gray-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer content */}
            <div className="flex-1 overflow-y-auto p-5">
              <BlogFilters {...filtersProps} />
            </div>

            {/* Drawer footer */}
            <div className="flex gap-3 border-t border-gray-100 p-4">
              <button
                type="button"
                onClick={clearFilters}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Clear all
              </button>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-xl bg-[var(--brand-purple)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                Show articles
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
