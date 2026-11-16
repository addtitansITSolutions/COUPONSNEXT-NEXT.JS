"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import StoreGrid from "@/components/public/stores/StoreGrid";
import type { StoreItem, StorePaginationData } from "@/components/public/stores/StoresClient";

interface CategoryStoresResponse {
  success: boolean;
  stores: StoreItem[];
  categories: {
    id: string;
    name: string;
    slug: string;
  }[];
  pagination: StorePaginationData;
}

interface CategoryStoresSectionProps {
  categorySlug: string;
  categoryName: string;
}

export default function CategoryStoresSection({ categorySlug, categoryName, }: CategoryStoresSectionProps) {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCategoryStores = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        category: categorySlug,
        page: "1",
        limit: "8",
      });
      const response = await fetch(
        `/api/public/stores?${params.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );
      const result = (await response.json()) as CategoryStoresResponse;
      if (!response.ok || !result.success) {
        throw new Error("Unable to load stores. Please try again.");
      }
      setStores(result.stores ?? []);
    } catch (err) {
      setError( err instanceof Error ? err.message : "Something went wrong while loading stores." );
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchCategoryStores();
  }, [fetchCategoryStores]);

  return (
    <section className="bg-white py-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[var(--brand-purple)]">
              <Store size={17} />
              <span>Explore Stores</span>
            </div>

            <h2 className="text-2xl font-extrabold tracking-tight text-[var(--brand-navy)] sm:text-3xl">
              Popular {categoryName} Stores
            </h2>
          </div>

          {!loading && stores.length > 0 && (
            <Link
              href={`/stores?category=${encodeURIComponent(categorySlug)}`}
              className="hidden md:inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[var(--brand-purple)] transition hover:text-[var(--accent-hover)]"
            >
              View All Stores
              <ArrowRight size={17} />
            </Link>
          )}
        </div>

        {/* Store Results */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchCategoryStores}
              className="mt-3 text-sm font-bold text-[var(--brand-purple)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : !loading && stores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-gray-50 px-5 py-12 text-center">
            <Store
              size={30}
              className="mx-auto text-[var(--muted)]"
            />

            <h3 className="mt-3 text-base font-bold text-[var(--brand-navy)]">
              No stores found
            </h3>

            <p className="mt-1 text-sm text-[var(--muted)]">
              There are currently no stores in this category.
              Check back soon!
            </p>
          </div>
        ) : (
          <StoreGrid stores={stores} loading={loading} />
        )}

        {/* View All on smaller screens / after results */}
        {!loading && stores.length > 0 && (
          <div className="mt-7 text-center md:hidden">
            <Link
              href={`/stores?category=${encodeURIComponent(categorySlug)}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
            >
              View All Stores
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
