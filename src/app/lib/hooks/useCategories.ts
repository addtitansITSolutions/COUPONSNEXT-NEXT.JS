"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "@/components/ui/toast/toast";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

import type { Category } from "@/components/admin/categories/CategoryTable";

const ITEMS_PER_PAGE = 7;
const SEARCH_DEBOUNCE_MS = 400;

type UseCategoriesOptions = {
  search: string;
  contentType: string;
  status: string;
  featured: string;
};

type CategoriesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function useCategories({ search,  contentType,  status, featured, }: UseCategoriesOptions) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<CategoriesPagination>({
      page: 1,
      limit: ITEMS_PER_PAGE,
      total: 0,
      totalPages: 0,
    });
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchCategories = useCallback( 
    async ( requestedPage: number, options?: { showRetryState?: boolean; } ) => {
      const showRetryState = options?.showRetryState ?? false;

      /*
       * Cancel the previous request if one is still running.
       */
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      try {
        if (showRetryState) {
          setIsRetrying(true);
        } else {
          setIsLoading(true);
        }
        setFetchError(null);
        const params = new URLSearchParams();
        params.set("page", String(requestedPage));
        params.set("limit", String(ITEMS_PER_PAGE));

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (contentType) {
          params.set("type", contentType);
        }

        if (status) {
          params.set("isActive", status);
        }

        if (featured) {
          params.set("isFeatured", featured);
        }

        const response = await fetch(
          `/api/admin/categories?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        /*
         * Ignore cancelled requests.
         */
        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok) {
          const message = getApiErrorMessageOnUi(
            data,
            "Unable to load categories."
          );
          setFetchError(message);
          toast.error(message);
          return;
        }

        if ( !data.success || !Array.isArray(data.categories)) {
          const message =
            "Unable to load categories.";

          setFetchError(message);
          toast.error(message);

          return;
        }

        setCategories(data.categories);

        if (data.pagination) {
          const nextPagination = {
            page: data.pagination.page,
            limit: data.pagination.limit,
            total: data.pagination.total,
            totalPages: data.pagination.totalPages,
          };

          setPagination(nextPagination);
          setPage(data.pagination.page);
        }
      } catch (error) {
        /*
         * AbortError is expected when a newer request
         * replaces an older request.
         */
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        const message =
          "Unable to load categories. Please check your connection and try again.";

        setFetchError(message);
        toast.error(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsRetrying(false);
        }
      }
    },
    [ search, contentType, status, featured, ]
  );

  /*
   * Initial load + debounced search/filter changes.
   */
  useEffect(() => {
    const timer = window.setTimeout( () => {
        setPage(1);
        fetchCategories(1);
      },
      search.trim() ? SEARCH_DEBOUNCE_MS : 0
    );

    return () => { window.clearTimeout(timer); };
  }, [ search, contentType, status, featured, fetchCategories, ]);

  /*
   * Cleanup on unmount.
   */
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const changePage = useCallback(
    (newPage: number) => {
      if ( newPage < 1 || newPage > pagination.totalPages || newPage === page || isLoading || isRetrying ) {
        return;
      }
      setPage(newPage);
      fetchCategories(newPage);
    },
    [
      page,
      pagination.totalPages,
      isLoading,
      isRetrying,
      fetchCategories,
    ]
  );

  const retry = useCallback(() => {
    fetchCategories(page, {
      showRetryState: true,
    });
  }, [fetchCategories, page]);

  return {
    categories,

    page,
    total: pagination.total,
    totalPages: pagination.totalPages,
    limit: pagination.limit,

    isLoading,
    isRetrying,
    fetchError,

    changePage,
    retry,

    setCategories,
  };
}