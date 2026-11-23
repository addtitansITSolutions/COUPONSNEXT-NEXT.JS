
"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  CalendarDays,
  Clock,
  Mail,
  ShieldCheck,
  Shield,
  UserRound,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  LogIn,
  LogOut,
  UserPlus,
  UserPen,
  KeyRound,
  UserCog,
  UserX,
  Trash2,
} from "lucide-react";

import type { User } from "@/lib/hooks/useUsers";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

type ActivityAction =
  | "USER_REGISTERED"
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_PROFILE_UPDATED"
  | "USER_PASSWORD_CHANGED"
  | "USER_ROLE_CHANGED"
  | "USER_STATUS_CHANGED"
  | "USER_DELETED";

interface UserActivity {
  id: string;
  user: string;
  performedBy: string | null;
  action: ActivityAction;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface UserDetailsData {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserDetailsApiResponse {
  success: boolean;
  user: UserDetailsData;
  activities: UserActivity[];
  message?: string;
  error?: string;
}

interface UserDetailsProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

function formatDate(date: string) {
  if (!date) return "—";

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

function getActivityIcon(action: ActivityAction) {
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

function getActivityColor(action: ActivityAction) {
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

export default function UserDetails({ user, open, onClose, }: UserDetailsProps) {
  const [userData, setUserData] =
    useState<UserDetailsData | null>(null);

  const [activities, setActivities] =
    useState<UserActivity[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  
    useEffect(() => {
    if (!open || !user?.id) {
        return;
    }

    // Capture the ID after the null check.
    const userId = user.id;

    const controller = new AbortController();

    async function fetchUserDetails() {
        try {
        setLoading(true);
        setError(null);

        const response = await fetch(
            `/api/admin/users/${userId}`,
            {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
            headers: {
                Accept: "application/json",
            },
            }
        );

        const data =
            (await response.json()) as UserDetailsApiResponse;

        if (!response.ok || !data.success) {
            throw new Error(
            getApiErrorMessageOnUi(
                data,
                "Failed to load user details."
            )
            );
        }

        setUserData(data.user);
        setActivities(data.activities ?? []);
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
            : "Something went wrong."
        );
        } finally {
        if (!controller.signal.aborted) {
            setLoading(false);
        }
        }
    }

    fetchUserDetails();

    return () => {
        controller.abort();
    };
    }, [open, user?.id, refreshKey]);


  if (!open || !user) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
        className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--brand-purple)]">
              <UserRound size={19} />
            </div>

            <div>
              <h2
                id="user-details-title"
                className="text-base font-semibold text-gray-900"
              >
                User details
              </h2>

              <p className="text-xs text-gray-500">
                Account information and activity history
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={19} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User profile */}
          <div className="border-b border-gray-100 px-5 py-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-xl font-semibold uppercase text-[var(--brand-purple)]">
                {user.name?.charAt(0) || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-lg font-semibold text-gray-900">
                  {user.name}
                </h3>

                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-gray-500">
                  <Mail size={14} />
                  {user.email}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-purple-50 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <ShieldCheck size={13} />
                    ) : (
                      <Shield size={13} />
                    )}

                    {user.role === "admin" ? "Admin" : "User"}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account information */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CalendarDays size={13} />
                  Registered
                </p>

                <p className="mt-1.5 text-sm font-medium text-gray-800">
                  {formatDate(userData?.createdAt ?? user.createdAt)}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock size={13} />
                  Last updated
                </p>

                <p className="mt-1.5 text-sm font-medium text-gray-800">
                  {formatDate(userData?.updatedAt ?? user.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Activity heading */}
          <div className="px-5 py-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Activity
                    size={17}
                    className="text-[var(--brand-purple)]"
                  />
                  Recent activity
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Latest 10 account activities
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRefreshKey((previous) => previous + 1)
                }
                disabled={loading}
                title="Refresh activity"
                aria-label="Refresh activity"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2
                  size={25}
                  className="animate-spin text-[var(--brand-purple)]"
                />

                <p className="mt-3 text-sm text-gray-500">
                  Loading activity...
                </p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-4">
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>
                    <p className="text-sm font-medium text-red-700">
                      Unable to load activity
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      {error}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRefreshKey((previous) => previous + 1)
                  }
                  className="mt-3 text-xs font-semibold text-red-700 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && activities.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-200 px-5 py-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Activity size={20} />
                </div>

                <p className="mt-3 text-sm font-medium text-gray-800">
                  No activity yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  User activities will appear here when recorded.
                </p>
              </div>
            )}

            {/* Activity timeline */}
            {!loading && !error && activities.length > 0 && (
              <div className="relative">
                {activities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.action);

                  return (
                    <div
                      key={activity.id}
                      className="relative flex gap-3 pb-6 last:pb-0"
                    >
                      {/* Timeline line */}
                      {index !== activities.length - 1 && (
                        <div className="absolute bottom-0 left-[17px] top-9 w-px bg-gray-200" />
                      )}

                      {/* Activity icon */}
                      <div
                        className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getActivityColor(activity.action)}`}
                      >
                        <Icon size={16} />
                      </div>

                      {/* Activity information */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium leading-5 text-gray-800">
                          {activity.description}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={12} />
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
