
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

interface UserStatsData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
}

interface UserStatsApiResponse {
  success: boolean;
  stats: UserStatsData;
  message?: string;
  error?: string;
}

const initialStats: UserStatsData = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  adminUsers: 0,
};

const statsConfig = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    color: "text-[var(--brand-purple)]",
    bg: "bg-purple-50",
  },
  {
    key: "activeUsers",
    label: "Active Users",
    icon: UserCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "inactiveUsers",
    label: "Inactive Users",
    icon: UserX,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    key: "adminUsers",
    label: "Administrators",
    icon: ShieldCheck,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
] as const;

export default function UserStats() {
  const [stats, setStats] = useState<UserStatsData>(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/users/stats", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        signal,
        headers: {
          Accept: "application/json",
        },
      });

      const data = (await response.json()) as UserStatsApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(data, "Failed to load user statistics.")
        );
      }

      setStats(data.stats);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load user statistics."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchStats(controller.signal);

    return () => controller.abort();
  }, [fetchStats]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.key}
            className="rounded-xl border border-[var(--border)] bg-white p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-500">
                {stat.label}
              </p>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}
              >
                <Icon size={19} />
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="h-8 w-20 animate-pulse rounded-md bg-gray-100" />
              ) : error ? (
                <button
                  type="button"
                  onClick={() => fetchStats()}
                  className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              ) : (
                <p className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                  {stats[stat.key].toLocaleString()}
                </p>
              )}
            </div>

            {error && !loading && (
              <p className="mt-2 text-xs text-red-500">
                Statistics unavailable
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
