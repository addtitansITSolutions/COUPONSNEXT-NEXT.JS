
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Clock,
  RefreshCw,
  LogIn,
  LogOut,
  UserPlus,
  UserPen,
  KeyRound,
  UserCog,
  UserX,
  Trash2,
  AlertCircle,
} from "lucide-react";

import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

interface ActivityApiResponse {
  success: boolean;
  activities: RecentActivity[];
  message?: string;
  error?: string;
}

interface ActivityTransition {
  nextStart: number;
  outgoing: RecentActivity;
}

const VISIBLE_COUNT = 10;
const FETCH_LIMIT = 20;
const ROTATION_INTERVAL = 4000;
const ANIMATION_DURATION = 450;

function getActivityIcon(action: string) {
  switch (action) {
    case "USER_REGISTERED":
      return UserPlus;
    case "USER_LOGIN":
      return LogIn;
    case "USER_LOGOUT":
      return LogOut;
    case "USER_PROFILE_UPDATED":
      return UserPen;
    case "USER_PASSWORD_CHANGED":
      return KeyRound;
    case "USER_ROLE_CHANGED":
      return UserCog;
    case "USER_STATUS_CHANGED":
      return UserX;
    case "USER_DELETED":
      return Trash2;
    default:
      return Activity;
  }
}

function getActivityColor(action: string) {
  switch (action) {
    case "USER_REGISTERED":
      return "bg-green-50 text-green-600";
    case "USER_LOGIN":
      return "bg-blue-50 text-blue-600";
    case "USER_LOGOUT":
      return "bg-gray-100 text-gray-600";
    case "USER_PROFILE_UPDATED":
      return "bg-purple-50 text-purple-600";
    case "USER_PASSWORD_CHANGED":
      return "bg-amber-50 text-amber-600";
    case "USER_ROLE_CHANGED":
      return "bg-indigo-50 text-indigo-600";
    case "USER_STATUS_CHANGED":
      return "bg-orange-50 text-orange-600";
    case "USER_DELETED":
      return "bg-red-50 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function getVisibleActivities(
  activities: RecentActivity[],
  startIndex: number
) {
  if (activities.length === 0) return [];

  const count = Math.min(VISIBLE_COUNT, activities.length);

  return Array.from({ length: count }, (_, index) => {
    return activities[(startIndex + index) % activities.length];
  });
}

export default function RecentActivitySidebar() {
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [transition, setTransition] =
    useState<ActivityTransition | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/admin/users/activity?limit=${FETCH_LIMIT}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal,
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = (await response.json()) as ActivityApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          getApiErrorMessageOnUi(
            data,
            "Failed to load recent activity."
          )
        );
      }

      setActivities(data.activities ?? []);
      setStartIndex(0);
      setTransition(null);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load recent activity."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  // Initial activity fetch.
  useEffect(() => {
    const controller = new AbortController();

    fetchActivities(controller.signal);

    return () => controller.abort();
  }, [fetchActivities]);

  // Rotate activities continuously.
  useEffect(() => {
    if (activities.length <= VISIBLE_COUNT) {
      return;
    }

    const interval = window.setInterval(() => {
      if (transition) return;

      const currentVisible = getVisibleActivities(
        activities,
        startIndex
      );

      const outgoing = currentVisible[currentVisible.length - 1];

      const nextStart = (startIndex + 1) % activities.length;

      if (!outgoing) return;

      setTransition({
        nextStart,
        outgoing,
      });

      window.setTimeout(() => {
        setStartIndex(nextStart);
        setTransition(null);
      }, ANIMATION_DURATION);
    }, ROTATION_INTERVAL);

    return () => window.clearInterval(interval);
  }, [activities, startIndex, transition]);

  const visibleActivities = transition
    ? getVisibleActivities(activities, transition.nextStart)
    : getVisibleActivities(activities, startIndex);

  const displayedActivities = transition
    ? [
        ...visibleActivities,
        transition.outgoing,
      ]
    : visibleActivities;

  return (
    <aside className="h-fit overflow-hidden rounded-xl border border-[var(--border)] bg-white">
      <style jsx>{`
        @keyframes activity-enter {
          from {
            opacity: 0;
            transform: translateY(-18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes activity-exit {
          from {
            opacity: 1;
            transform: translateY(0);
            max-height: 110px;
          }
          to {
            opacity: 0;
            transform: translateY(22px);
            max-height: 0;
            margin-bottom: 0;
          }
        }

        .activity-enter {
          animation: activity-enter 450ms ease both;
        }

        .activity-exit {
          overflow: hidden;
          animation: activity-exit 450ms ease both;
        }

        @media (prefers-reduced-motion: reduce) {
          .activity-enter,
          .activity-exit {
            animation: none;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Activity
              size={17}
              className="text-[var(--brand-purple)]"
            />
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Latest account activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchActivities()}
          disabled={loading}
          aria-label="Refresh recent activity"
          title="Refresh activity"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-[var(--brand-purple)] disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>

      {/* Activity List */}
      <div className="p-5">
        {loading ? (
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-100" />

                <div className="min-w-0 flex-1 space-y-2 pt-1">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <AlertCircle
              size={22}
              className="mx-auto text-red-500"
            />

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => fetchActivities()}
              className="mt-3 text-xs font-semibold text-[var(--brand-purple)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center">
            <Activity
              size={24}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-medium text-gray-700">
              No activity yet
            </p>

            <p className="mt-1 text-xs text-gray-500">
              User activity will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {displayedActivities.map((activity, index) => {
              const isOutgoing =
                transition &&
                index === displayedActivities.length - 1;

              const isEntering = transition && index === 0;

              const Icon = getActivityIcon(activity.action);

              return (
                <div
                  key={
                    isOutgoing
                      ? `outgoing-${activity.id}`
                      : activity.id
                  }
                  className={`flex gap-3 ${
                    isOutgoing
                      ? "activity-exit"
                      : isEntering
                        ? "activity-enter"
                        : ""
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getActivityColor(
                      activity.action
                    )}`}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-5 text-gray-800">
                      {activity.description}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      {activity.userName || "Deleted user"}
                      {activity.userEmail
                        ? ` · ${activity.userEmail}`
                        : ""}
                    </p>

                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock size={11} />
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}