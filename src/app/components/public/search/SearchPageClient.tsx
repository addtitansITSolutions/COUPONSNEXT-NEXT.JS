
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  Store,
  TicketPercent,
  BookOpen,
  Tags,
  ArrowRight,
  X,
} from "lucide-react";

import SearchResultCard from "./SearchResultCard";
import SearchEmptyState from "./SearchEmptyState";

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

interface SearchPageClientProps {
  initialQuery: string;
}

const EMPTY_RESULTS: SearchResults = {
  stores: [],
  coupons: [],
  blogs: [],
  categories: [],
};

const EMPTY_COUNTS = {
  stores: 0,
  coupons: 0,
  blogs: 0,
  categories: 0,
  total: 0,
};

const MIN_QUERY_LENGTH = 2;

export default function SearchPageClient({
  initialQuery,
}: SearchPageClientProps) {
  const router = useRouter();
  const requestRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");

  const search = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();

    requestRef.current?.abort();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults(EMPTY_RESULTS);
      setCounts(EMPTY_COUNTS);
      setHasSearched(false);
      setIsLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    setIsLoading(true);
    setError("");

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
        throw new Error("Unable to fetch search results.");
      }

      const data: SearchResponse = await response.json();

      if (controller.signal.aborted) return;

      if (!data.success) {
        throw new Error("Something went wrong while searching.");
      }

      setResults(data.results);
      setCounts(data.counts);
      setHasSearched(true);
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === "AbortError"
      ) {
        return;
      }

      if (controller.signal.aborted) return;

      setResults(EMPTY_RESULTS);
      setCounts(EMPTY_COUNTS);
      setHasSearched(true);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Synchronize the input and results with the URL query.
  useEffect(() => {
    const trimmedQuery = initialQuery.trim();

    setQuery(initialQuery);

    if (trimmedQuery.length >= MIN_QUERY_LENGTH) {
      search(trimmedQuery);
    } else {
      requestRef.current?.abort();
      setResults(EMPTY_RESULTS);
      setCounts(EMPTY_COUNTS);
      setHasSearched(false);
      setIsLoading(false);
      setError("");
    }

    return () => {
      requestRef.current?.abort();
    };
  }, [initialQuery, search]);

  // Abort pending requests when the component unmounts.
  useEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) return;

    const nextUrl = `/search?q=${encodeURIComponent(trimmedQuery)}`;

    if (trimmedQuery === initialQuery.trim()) {
      search(trimmedQuery);
      return;
    }

    router.push(nextUrl);
  };

  const clearSearch = () => {
    requestRef.current?.abort();

    setQuery("");
    setResults(EMPTY_RESULTS);
    setCounts(EMPTY_COUNTS);
    setHasSearched(false);
    setIsLoading(false);
    setError("");

    router.push("/search");
  };

  const resultSections = [
    {
      title: "Stores",
      description: "Find your favorite brands and retailers.",
      icon: Store,
      count: counts.stores,
      items: results.stores,
      type: "stores",
    },
    {
      title: "Coupons & Deals",
      description: "Save more with the latest offers.",
      icon: TicketPercent,
      count: counts.coupons,
      items: results.coupons,
      type: "coupons",
    },
    {
      title: "Blogs",
      description: "Explore shopping guides and articles.",
      icon: BookOpen,
      count: counts.blogs,
      items: results.blogs,
      type: "blogs",
    },
    {
      title: "Categories",
      description: "Browse offers by shopping category.",
      icon: Tags,
      count: counts.categories,
      items: results.categories,
      type: "categories",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Search Hero */}
      
    {/* Search Hero */}
    <section className="relative isolate overflow-hidden border-b border-[var(--border)] bg-white">

    <style>{`
        .cn-search-glow {
        position: absolute;
        inset: 0;
        background:
            radial-gradient(
            60% 65% at 50% 35%,
            color-mix(in srgb, var(--brand-purple) 22%, transparent),
            transparent 75%
            ),
            radial-gradient(
            40% 45% at 90% 85%,
            color-mix(in srgb, var(--brand-yellow) 16%, transparent),
            transparent 75%
            ),
            radial-gradient(
            35% 40% at 5% 10%,
            color-mix(in srgb, var(--brand-purple) 10%, transparent),
            transparent 75%
            );
        }

        .cn-search-dots {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(
            rgba(80, 55, 100, .35) 1.1px,
            transparent 1.7px
        );
        background-size: 24px 24px;
        opacity: .18;
        mask-image: radial-gradient(
            ellipse at 50% 45%,
            transparent 15%,
            #000 90%
        );
        }

        .cn-search-band {
        position: absolute;
        left: -10%;
        width: 120%;
        transform: rotate(-5deg);
        pointer-events: none;
        }

        .cn-search-track {
        display: flex;
        width: max-content;
        animation: cn-search-marquee 75s linear infinite;
        }

        .cn-search-track-reverse {
        animation-direction: reverse;
        animation-duration: 90s;
        }

        .cn-search-row {
        display: flex;
        align-items: center;
        gap: 2rem;
        padding-right: 2rem;
        }

        .cn-search-word {
        display: inline-flex;
        align-items: center;
        gap: 2rem;
        color: transparent;
        -webkit-text-stroke: 1.5px rgba(75, 45, 100, .12);
        font-size: clamp(3rem, 8vw, 6.5rem);
        font-weight: 900;
        line-height: 1;
        letter-spacing: -.03em;
        text-transform: uppercase;
        white-space: nowrap;
        }

        .cn-search-word-yellow {
        -webkit-text-stroke-color: color-mix(
            in srgb,
            var(--brand-yellow) 45%,
            transparent
        );
        }

        .cn-search-star {
        color: color-mix(
            in srgb,
            var(--brand-purple) 30%,
            transparent
        );
        -webkit-text-stroke: 0;
        font-size: .45em;
        }

        .cn-search-fade {
        position: absolute;
        inset: 0;
        background: linear-gradient(
            to bottom,
            transparent 65%,
            rgba(255,255,255,.45) 82%,
            white 100%
        );
        }

        .cn-search-rise {
        animation: cn-search-rise .8s cubic-bezier(.215,.61,.355,1) both;
        }

        @keyframes cn-search-marquee {
        to {
            transform: translateX(-50%);
        }
        }

        @keyframes cn-search-rise {
        from {
            opacity: 0;
            transform: translateY(18px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
        }

        @media (prefers-reduced-motion: reduce) {
        .cn-search-track,
        .cn-search-rise {
            animation: none !important;
        }
        }
    `}</style>

    {/* Background Effects */}
    <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
        <div className="cn-search-glow" />
        <div className="cn-search-dots" />

        {/* Purple ticker */}
        <div className="cn-search-band top-[8%]">
        <div className="cn-search-track">
            {[0, 1].map((k) => (
            <div key={k} className="cn-search-row">
                {[
                "Smart Shopping",
                "Exclusive Coupons",
                "Best Deals",
                "Save More",
                ].map((word, i) => (
                <span key={`${k}-${i}`} className="cn-search-word">
                    {word}
                    <span className="cn-search-star">✦</span>
                </span>
                ))}
            </div>
            ))}
        </div>
        </div>

        {/* Yellow ticker */}
        <div className="cn-search-band top-[65%] hidden sm:block">
        <div className="cn-search-track cn-search-track-reverse">
            {[0, 1].map((k) => (
            <div key={k} className="cn-search-row">
                {[
                "Find Your Favorites",
                "Discover Brands",
                "Shopping Inspiration",
                "Better Savings",
                ].map((word, i) => (
                <span
                    key={`${k}-${i}`}
                    className="cn-search-word cn-search-word-yellow"
                >
                    {word}
                    <span className="cn-search-star">✦</span>
                </span>
                ))}
            </div>
            ))}
        </div>
        </div>

        {/* Bottom fade */}
        <div className="cn-search-fade" />
    </div>

    {/* Content */}
    <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">

        <h1 className="cn-search-rise text-3xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-4xl lg:text-5xl">
            Search{" "}
            <span className="text-[var(--brand-purple)]">
            CouponsNext.
            </span>
        </h1>

        <p
            className="cn-search-rise mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base"
            style={{ animationDelay: ".12s" }}
        >
            Find stores, exclusive coupons, deals and helpful
            shopping guides — all in one place.
        </p>

        {/* Search Form */}
        <form
            onSubmit={handleSubmit}
            className="cn-search-rise mx-auto mt-8 flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-2 shadow-[0_15px_55px_rgba(35,20,55,0.12)] transition-shadow duration-300 focus-within:shadow-[0_18px_60px_rgba(100,55,150,0.17)]"
            style={{ animationDelay: ".22s" }}
        >
            <Search
            size={21}
            className="ml-3 shrink-0 text-gray-400"
            />

            <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stores, coupons, deals and blogs..."
            autoComplete="off"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:text-base"
            />

            {query && (
            <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
                <X size={17} />
            </button>
            )}

            <button
            type="submit"
            disabled={
                query.trim().length < MIN_QUERY_LENGTH ||
                isLoading
            }
            className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[var(--brand-purple)] px-4 text-sm font-semibold text-white transition-all hover:bg-[var(--accent-hover)] hover:shadow-lg hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
            >
            {isLoading ? (
                <Loader2 size={17} className="animate-spin" />
            ) : (
                <Search size={17} />
            )}

            <span className="hidden sm:inline">Search</span>
            </button>
        </form>

        </div>
    </div>
    </section>


      {/* Search Results */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        
        
        {/* Results Header */}
        {hasSearched && !isLoading && !error && (
        <div className="mb-9 flex min-w-0 items-center justify-between gap-3 border-b border-[var(--border)] pb-6">
            <div className="min-w-0 flex-1">
            <p className="text-xs text-[var(--muted)] sm:text-sm">
                Search results for
            </p>

            <h2
                title={initialQuery.trim()}
                className="mt-1 truncate text-lg font-bold text-[var(--foreground)] sm:text-2xl"
            >
                &ldquo;{initialQuery.trim()}&rdquo;
            </h2>

            <p className="mt-1 text-xs text-[var(--muted)] sm:mt-2 sm:text-sm">
                {counts.total}{" "}
                {counts.total === 1 ? "result" : "results"} found
            </p>
            </div>

            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] px-2 py-2 text-[10px] font-medium text-[var(--muted)] sm:gap-2 sm:px-3 sm:text-xs">
            <Tags size={14} />
            <span className="hidden min-[380px]:inline">
                All result types
            </span>
            </div>
        </div>
        )}



        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
              <Loader2 size={26} className="animate-spin" />
            </div>

            <h3 className="mt-5 text-base font-semibold text-[var(--foreground)]">
              Searching CouponsNext...
            </h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Finding the best matching stores, coupons and content.
            </p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <SearchEmptyState
            type="error"
            message={error}
            onRetry={() => search(query)}
          />
        )}

        {/* Initial State */}
        {!isLoading && !hasSearched && !error && (
          <SearchEmptyState type="initial" />
        )}

        {/* No Results */}
        {!isLoading &&
          hasSearched &&
          !error &&
          counts.total === 0 && (
            <SearchEmptyState
              type="empty"
              query={initialQuery.trim()}
            />
          )}

        {/* Result Sections */}
        {!isLoading &&
          hasSearched &&
          !error &&
          counts.total > 0 && (
            <div className="space-y-12">
              {resultSections.map((section) => {
                if (!section.items.length) return null;

                const Icon = section.icon;

                return (
                  <section key={section.type}>
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-purple)]/10 text-[var(--brand-purple)]">
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-[var(--foreground)] sm:text-xl">
                            {section.title}
                          </h3>

                          <p className="mt-0.5 text-xs text-[var(--muted)] sm:text-sm">
                            {section.description}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-[var(--brand-purple)]/10 px-3 py-1 text-xs font-bold text-[var(--brand-purple)]">
                        {section.count}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {section.items.map((item) => (
                        <SearchResultCard
                          key={`${section.type}-${item.id}`}
                          item={item}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
      </section>
    </main>
  );
}