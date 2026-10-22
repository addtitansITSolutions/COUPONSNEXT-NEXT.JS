"use client";
import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export type BlogStatus = "draft" | "published" | "scheduled";

export interface BlogContentNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: BlogContentNode[];
  marks?: Array<Record<string, unknown>>;
  text?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: BlogContentNode;
  featuredImage?: string;
  featuredImageAlt?: string;
  author: BlogAuthor | null;
  category: BlogCategory | null;
  tags: string[];
  status: BlogStatus;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  viewCount: number;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogFilters {
  search: string;
  category: string;
  author: string;
  status: string;
  isActive: string;
  isFeatured: string;
}



interface BlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseBlogsOptions {
  initialLimit?: number;
}

interface UseBlogsReturn {
  blogs: Blog[];
  pagination: BlogPagination;
  filters: BlogFilters;
  loading: boolean;
  error: string | null;

  setSearch: (value: string) => void;
  setCategory: (value: string) => void;
  setAuthor: (value: string) => void;
  setStatus: (value: string) => void;
  setIsActive: (value: string) => void;
  setIsFeatured: (value: string) => void;

  setPage: (page: number) => void;
  setLimit: (limit: number) => void;

  refresh: () => Promise<void>;
  getBlog: (id: string) => Promise<Blog>;
  createBlog: (data: Record<string, unknown>) => Promise<Blog>;
  updateBlog: (
    id: string,
    data: Record<string, unknown>
  ) => Promise<Blog>;
  deleteBlog: (id: string) => Promise<void>;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: BlogFilters = {
  search: "",
  category: "",
  author: "",
  status: "",
  isActive: "",
  isFeatured: "",
};

const DEFAULT_PAGINATION: BlogPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function useBlogs( options: UseBlogsOptions = {} ): UseBlogsReturn {
  const initialLimit = options.initialLimit ?? 10;
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pagination, setPagination] = useState<BlogPagination>({
    ...DEFAULT_PAGINATION,
    limit: initialLimit,
  });
  const [filters, setFilters] = useState<BlogFilters>(DEFAULT_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);

    return () => clearTimeout(timeout);
  }, [filters.search]);

  // Build the API query string.
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    params.set("page", String(pagination.page));
    params.set("limit", String(pagination.limit));

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }

    if (filters.category) {
      params.set("category", filters.category);
    }

    if (filters.author) {
      params.set("author", filters.author);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.isActive) {
      params.set("isActive", filters.isActive);
    }

    if (filters.isFeatured) {
      params.set("isFeatured", filters.isFeatured);
    }

    return params.toString();
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    filters.category,
    filters.author,
    filters.status,
    filters.isActive,
    filters.isFeatured,
  ]);

  // Fetch blogs.
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requestedPage = pagination.page;
      const queryString = buildQueryString();

      const response = await fetch(
        `/api/admin/blogs?${queryString}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(data, "Failed to fetch blogs.")
        );
      }

      const nextPagination: BlogPagination = data.pagination;

      // Keep the current page within the valid range.
      const safePage =
        nextPagination.totalPages > 0
          ? Math.min(requestedPage, nextPagination.totalPages)
          : 1;

      if (safePage !== requestedPage) {
        setPagination((previous) => ({
          ...previous,
          page: safePage,
        }));
        return;
      }

      setBlogs(data.blogs);
      setPagination(nextPagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch blogs."
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, buildQueryString]);

  useEffect(() => {
    void fetchBlogs();
  }, [fetchBlogs]);

  // Filter setters.
  const setSearch = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, search: value }));
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  const setCategory = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, category: value }));
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  const setAuthor = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, author: value }));
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  const setStatus = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, status: value }));
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  const setIsActive = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, isActive: value }));
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  const setIsFeatured = useCallback((value: string) => {
    setFilters((previous) => ({ ...previous, isFeatured: value }));
    setPagination((previous) => ({ ...previous, page: 1 }));
  }, []);

  // Pagination setters.
  const setPage = useCallback((page: number) => {
    setPagination((previous) => ({ ...previous, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((previous) => ({
      ...previous,
      limit,
      page: 1,
    }));
  }, []);

  // Refresh the current listing.
  const refresh = useCallback(async () => {
    await fetchBlogs();
  }, [fetchBlogs]);

  // Fetch one blog for editing.
  const getBlog = useCallback(async (id: string): Promise<Blog> => {
    const response = await fetch(`/api/admin/blogs/${id}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        getApiErrorMessageOnUi(data, "Failed to fetch blog.")
      );
    }

    return data.blog as Blog;
  }, []);

  // Create a blog.
  const createBlog = useCallback( async (blogData: Record<string, unknown>): Promise<Blog> => {
      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(data, "Failed to create blog.")
        );
      }

      await fetchBlogs();

      return data.blog as Blog;
    },
    [fetchBlogs]
  );

  // Update a blog.
  const updateBlog = useCallback( async ( id: string, updateData: Record<string, unknown> ): Promise<Blog> => {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(data, "Failed to update blog.")
        );
      }

      const updatedBlog = data.blog as Blog;

      setBlogs((previousBlogs) =>
        previousBlogs.map((blog) =>
          blog.id === id ? updatedBlog : blog
        )
      );

      return updatedBlog;
    },
    []
  );

  // Delete a blog.
  const deleteBlog = useCallback( async (id: string) => {
      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(data, "Failed to delete blog.")
        );
      }

      await fetchBlogs();
    },
    [fetchBlogs]
  );

  // Clear all filters.
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  }, []);

  return {
    blogs,
    pagination,
    filters,
    loading,
    error,
    setSearch,
    setCategory,
    setAuthor,
    setStatus,
    setIsActive,
    setIsFeatured,
    setPage,
    setLimit,
    refresh,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog,
    clearFilters,
  };
}