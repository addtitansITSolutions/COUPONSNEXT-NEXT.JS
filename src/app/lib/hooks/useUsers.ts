"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFilters {
  search: string;
  role: UserRole | "";
  isActive: boolean | "";
}

export interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface UseUserOptions {
  initialLimit?: number;
  initialFilters?: Partial<UserFilters>;
}

interface UsersApiResponse {
  success: boolean;
  users: User[];
  pagination: UserPagination;
  message?: string;
  error?: string;
}

interface UserMutationResponse {
  success: boolean;
  user: User;
  message?: string;
  error?: string;
}

interface DeleteUserResponse {
  success: boolean;
  message?: string;
  error?: string;
}

const DEFAULT_PAGINATION: UserPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function useUser(options: UseUserOptions = {}) {
  const {
    initialLimit = 20,
    initialFilters = {},
  } = options;
  const initialFiltersValue: UserFilters = {
    search: initialFilters.search ?? "",
    role: initialFilters.role ?? "",
    isActive: initialFilters.isActive ?? "",
  };
  const initialFiltersRef = useRef<UserFilters>(initialFiltersValue);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<UserPagination>({
    ...DEFAULT_PAGINATION,
    limit: initialLimit,
  });

  const [filters, setFilters] = useState<UserFilters>(
    () => initialFiltersValue
  );

  const [debouncedSearch, setDebouncedSearch] = useState(
    () => initialFiltersValue.search
  );


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  /*
   * Debounce Search
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  /*
   * Fetch Users
   */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: String(pagination.page),
          limit: String(pagination.limit),
        });

        if (debouncedSearch.trim()) {
          params.set("search", debouncedSearch.trim());
        }

        if (filters.role) {
          params.set("role", filters.role);
        }

        if (filters.isActive !== "") {
          params.set("isActive", String(filters.isActive));
        }

        const response = await fetch(
          `/api/admin/users?${params.toString()}`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data = (await response.json()) as UsersApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            getApiErrorMessageOnUi(
              data,
              "Failed to fetch users."
            )
          );
        }

        // Handle a page that no longer exists.
        const safePage =
          data.pagination.totalPages > 0
            ? Math.min(
                pagination.page,
                data.pagination.totalPages
              )
            : 1;

        if (safePage !== pagination.page) {
          setPagination((current) => ({
            ...current,
            page: safePage,
          }));

          return;
        }

        setUsers(data.users);

        setPagination((current) => ({
          ...current,
          ...data.pagination,
        }));
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching users."
        );

        setUsers([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchUsers();

    return () => controller.abort();
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    filters.role,
    filters.isActive,
    refreshKey,
  ]);

  /*
   * Search
   */
  const setSearch = useCallback((search: string) => {
    setFilters((current) => ({
      ...current,
      search,
    }));

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }, []);

  /*
   * Role Filter
   */
  const setRole = useCallback((role: UserRole | "") => {
    setFilters((current) => ({
      ...current,
      role,
    }));

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }, []);

  /*
   * Active Status Filter
   */
  const setIsActive = useCallback(
    (isActive: boolean | "") => {
      setFilters((current) => ({
        ...current,
        isActive,
      }));

      setPagination((current) => ({
        ...current,
        page: 1,
      }));
    },
    []
  );

  /*
   * Pagination
   */
  const setPage = useCallback((page: number) => {
    setPagination((current) => ({
      ...current,
      page: Math.max(
        1,
        Math.min(page, current.totalPages || 1)
      ),
    }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination((current) => ({
      ...current,
      page: 1,
      limit: Math.max(1, Math.min(limit, 100)),
    }));
  }, []);

  /*
   * Refresh
   */
  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  /*
   * Clear Filters
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFiltersRef.current);

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  }, []);

  /*
   * Update User
   */
  const updateUser = useCallback(
    async (
      id: string,
      updateData: Record<string, unknown>
    ): Promise<User> => {
      const response = await fetch(
        `/api/admin/users/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updateData),
        }
      );

      const data =
        (await response.json()) as UserMutationResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(
            data,
            "Failed to update user."
          )
        );
      }

      refresh();

      return data.user;
    },
    [refresh]
  );

  /*
   * Delete User
   */
  const deleteUser = useCallback(
    async (id: string): Promise<void> => {
      const response = await fetch(
        `/api/admin/users/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data =
        (await response.json()) as DeleteUserResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(
            data,
            "Failed to delete user."
          )
        );
      }

      refresh();
    },
    [refresh]
  );

  return {
    users,
    pagination,
    filters,

    loading,
    error,

    setSearch,
    setRole,
    setIsActive,

    setPage,
    setLimit,

    refresh,
    clearFilters,

    updateUser,
    deleteUser,
  };
}