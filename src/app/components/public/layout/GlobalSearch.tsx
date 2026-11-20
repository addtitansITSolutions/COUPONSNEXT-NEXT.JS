"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Loader2,
  Store,
  TicketPercent,
  BookOpen,
  Tags,
  ArrowRight,
  X,
  Command,
} from "lucide-react";

interface SearchStore {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  type: "store";
  href: string;
}

interface SearchCoupon {
  id: string;
  title: string;
  slug: string;
  type: "code" | "deal";
  code?: string;
  image?: string;
  discount?: string;
  store: {
    name: string;
    slug: string;
    logo?: string;
  };
  typeLabel: "coupon";
  href: string;
}

interface SearchBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  type: "blog";
  href: string;
}

interface SearchCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  contentTypes: string[];
  type: "category";
  href: string;
}

interface SearchResults {
  stores: SearchStore[];
  coupons: SearchCoupon[];
  blogs: SearchBlog[];
  categories: SearchCategory[];
}

interface SearchResponse {
  success: boolean;
  query: string;
  results: SearchResults;
  counts: {
    stores: number;
    coupons: number;
    blogs: number;
    categories: number;
    total: number;
  };
}

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
  onNavigate?: () => void;
}

const DEBOUNCE_DELAY = 400;

const EMPTY_RESULTS: SearchResults = {
  stores: [],
  coupons: [],
  blogs: [],
  categories: [],
};

type SearchItem =
  | SearchStore
  | SearchCoupon
  | SearchBlog
  | SearchCategory;

export default function GlobalSearch({
  className = "",
  placeholder = "Search stores, coupons and deals...",
  onNavigate,
}: GlobalSearchProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const allItems: SearchItem[] = [
    ...results.stores,
    ...results.coupons,
    ...results.blogs,
    ...results.categories,
  ];

  const totalResults = allItems.length;

  const closeSearch = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
  }, []);

  const navigateTo = useCallback(
    (href: string) => {
      closeSearch();
      onNavigate?.();
      router.push(href);
    },
    [closeSearch, onNavigate, router]
  );

  // Fetch suggestions with debounce.
  useEffect(() => {
    const trimmedQuery = query.trim();

    requestRef.current?.abort();

    if (trimmedQuery.length < 2) {
      setResults(EMPTY_RESULTS);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    // Show loading immediately, including during debounce.
    setIsLoading(true);
    setResults(EMPTY_RESULTS);
    setActiveIndex(-1);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/public/search?q=${encodeURIComponent(trimmedQuery)}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Search request failed");
        }

        const data: SearchResponse = await response.json();

        if (controller.signal.aborted) return;

        if (data.success) {
          setResults(data.results);
        } else {
          setResults(EMPTY_RESULTS);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setResults(EMPTY_RESULTS);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  // Close dropdown when clicking outside.
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // Keyboard navigation.
  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Escape") {
      closeSearch();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        setIsOpen(true);
        return;
      }

      setActiveIndex((current) =>
        totalResults
          ? (current + 1) % totalResults
          : -1
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((current) =>
        totalResults
          ? current <= 0
            ? totalResults - 1
            : current - 1
          : -1
      );

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (activeIndex >= 0 && allItems[activeIndex]) {
        navigateTo(allItems[activeIndex].href);
      } else if (query.trim().length >= 2) {
        navigateTo(
          `/search?q=${encodeURIComponent(query.trim())}`
        );
      }
    }
  };

  // Render individual result sections.
  const renderSection = <T extends SearchItem>(
    title: string,
    items: T[],
    icon: ReactNode,
    startIndex: number,
    renderItem: (
      item: T,
      index: number,
      active: boolean
    ) => ReactNode
  ) => {
    if (!items.length) return null;

    return (
      <section className="py-2">
        <div className="flex items-center gap-2 px-4 pb-2 pt-1">
          <span className="text-[var(--brand-purple)]">
            {icon}
          </span>

          <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
            {title}
          </h3>

          <span className="ml-auto text-[10px] font-semibold text-[var(--muted)]">
            {items.length}
          </span>
        </div>

        <div>
          {items.map((item, index) =>
            renderItem(
              item,
              startIndex + index,
              activeIndex === startIndex + index
            )
          )}
        </div>
      </section>
    );
  };

  // Render individual search result.
  const renderResult = (
    item: SearchItem,
    index: number,
    active: boolean,
    image?: string,
    label?: string
  ) => (
    <button
      key={`${item.type}-${item.id}`}
      type="button"
      onClick={() => navigateTo(item.href)}
      onMouseEnter={() => setActiveIndex(index)}
      id={`global-search-option-${index}`}
      role="option"
      aria-selected={active}
      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
        active
          ? "bg-[var(--brand-purple)]/8"
          : "hover:bg-[var(--background)]"
      }`}
    >
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="40px"
            unoptimized
            className="object-contain p-1"
          />
        ) : (
          <span className="text-[var(--brand-purple)]">
            {item.type === "store" ? (
              <Store size={18} />
            ) : item.type === "code" ||
              item.type === "deal" ? (
              <TicketPercent size={18} />
            ) : item.type === "blog" ? (
              <BookOpen size={18} />
            ) : (
              <Tags size={18} />
            )}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--foreground)]">
          {"name" in item ? item.name : item.title}
        </p>

        {label && (
          <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
            {label}
          </p>
        )}
      </div>

      <ArrowRight
        size={15}
        className={`shrink-0 transition-colors ${
          active
            ? "text-[var(--brand-purple)]"
            : "text-[var(--muted)]"
        }`}
      />
    </button>
  );

  const showDropdown =
    isOpen && query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {/* Search input */}
      <div
          className={`relative flex h-10 items-center rounded-xl border transition-all ${
          isOpen
            ? "border-[var(--brand-purple)] ring-2 ring-[var(--brand-purple)]/10"
            : "border-[var(--border)]"
        }`}
        style={{ backgroundColor: "var(--background)" }}
      >
        <Search
          size={18}
          className="absolute left-4 shrink-0 text-[var(--muted)]"
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="global-search-results"
          aria-activedescendant={
            activeIndex >= 0
              ? `global-search-option-${activeIndex}`
              : undefined
          }
          className="h-full w-full rounded-xl bg-transparent pl-11 pr-11 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
        />

        {/* Single custom clear button */}
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              setResults(EMPTY_RESULTS);
              setIsOpen(true);
              inputRef.current?.focus();
            }}
            className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--background)] hover:text-[var(--foreground)]"
          >
            <X size={15} />
          </button>
        )}

        {!query && (
          <span className="absolute right-3 hidden items-center gap-1 rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)] xl:flex">
            <Command size={10} />
          </span>
        )}
      </div>

      {/* Search dropdown */}
      {showDropdown && (
        <div
          id="global-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-[1001] mt-2 max-h-[min(70vh,520px)] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl"
        >
          {/* Single-character query */}
          {query.trim().length < 2 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">
                Keep typing...
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Enter at least 2 characters to search.
              </p>
            </div>
          ) : isLoading ? (
            /* Loading state */
            <div className="flex items-center justify-center gap-3 px-4 py-10 text-sm text-[var(--muted)]">
              <Loader2
                size={19}
                className="animate-spin text-[var(--brand-purple)]"
              />

              <span>
                Searching stores, coupons and blogs...
              </span>
            </div>
          ) : totalResults === 0 ? (
            /* No results state */
            <div className="px-5 py-10 text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
                <Search size={20} />
              </div>

              <p className="text-sm font-semibold text-[var(--foreground)]">
                No results found
              </p>

              <p className="mt-1 text-xs text-[var(--muted)]">
                Try another keyword or check your spelling.
              </p>
            </div>
          ) : (
            /* Search results */
            <>
              {renderSection(
                "Stores",
                results.stores,
                <Store size={14} />,
                0,
                (item, index, active) =>
                  renderResult(
                    item,
                    index,
                    active,
                    item.logo,
                    "Store"
                  )
              )}

              {renderSection(
                "Coupons & Deals",
                results.coupons,
                <TicketPercent size={14} />,
                results.stores.length,
                (item, index, active) =>
                  renderResult(
                    item,
                    index,
                    active,
                    item.image || item.store.logo,
                    `${item.type === "code" ? "Coupon code" : "Deal"} · ${item.store.name}${item.discount ? ` · ${item.discount}` : ""}`
                  )
              )}

              {renderSection(
                "Blogs",
                results.blogs,
                <BookOpen size={14} />,
                results.stores.length +
                  results.coupons.length,
                (item, index, active) =>
                  renderResult(
                    item,
                    index,
                    active,
                    item.featuredImage,
                    "Article"
                  )
              )}

              {renderSection(
                "Categories",
                results.categories,
                <Tags size={14} />,
                results.stores.length +
                  results.coupons.length +
                  results.blogs.length,
                (item, index, active) =>
                  renderResult(
                    item,
                    index,
                    active,
                    item.image,
                    "Category"
                  )
              )}

              {/* View all results */}
              <div className="border-t border-[var(--border)] p-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => {
                    closeSearch();
                    onNavigate?.();
                  }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-[var(--brand-purple)] transition-colors hover:bg-[var(--brand-purple)]/8"
                >
                  <span>
                    View all {totalResults} results for "{query.trim()}"
                  </span>

                  <ArrowRight size={15} />
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
