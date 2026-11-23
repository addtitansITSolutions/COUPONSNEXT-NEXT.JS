
"use client";

import {
  Activity,
  CalendarDays,
  ShieldCheck,
  Shield,
  Pencil,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";

import type { User } from "@/lib/hooks/useUsers";

interface UserTableProps {
  users: User[];
  currentAdminId: string;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleActive: (user: User) => void;
  onToggleRole: (user: User) => void;
  onViewActivity: (user: User) => void;
  actionLoadingId?: string | null;
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
  }).format(parsedDate);
}

export default function UserTable({
  users,
  currentAdminId,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleRole,
  onViewActivity,
  actionLoadingId = null,
}: UserTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                User
              </th>

              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Role
              </th>

              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>

              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Registered
              </th>

              <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Account
              </th>

              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const isCurrentAdmin =
                user.id === currentAdminId;

              const isLoading =
                actionLoadingId === user.id;

              return (
                <tr
                  key={user.id}
                  className="transition hover:bg-gray-50/70"
                >
                  {/* User information */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] text-sm font-semibold uppercase text-[var(--brand-purple)]">
                        {user.name?.charAt(0) || "U"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {user.name}
                          </p>

                          {isCurrentAdmin && (
                            <span className="shrink-0 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-[var(--brand-purple)]">
                              YOU
                            </span>
                          )}
                        </div>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-4 py-4">
                    {user.role === "admin" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700">
                        <ShieldCheck size={13} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        <Shield size={13} />
                        User
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Registration date */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <CalendarDays
                        size={14}
                        className="shrink-0 text-gray-400"
                      />
                      {formatDate(user.createdAt)}
                    </div>
                  </td>

                  {/* Account information */}
                  <td className="px-4 py-4">
                    <span className="text-xs text-gray-500">
                      {isCurrentAdmin
                        ? "Your account"
                        : "Registered user"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* View activity */}
                      <button
                        type="button"
                        onClick={() => onViewActivity(user)}
                        disabled={isLoading}
                        title="View activity"
                        aria-label={`View activity for ${user.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-50 hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Activity size={16} />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        disabled={isLoading}
                        title="Edit user"
                        aria-label={`Edit ${user.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Toggle role */}
                      <button
                        type="button"
                        onClick={() => onToggleRole(user)}
                        disabled={isLoading || isCurrentAdmin}
                        title={
                          isCurrentAdmin
                            ? "You cannot change your own role"
                            : user.role === "admin"
                              ? "Change to user"
                              : "Promote to admin"
                        }
                        aria-label={`Change role for ${user.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-50 hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {user.role === "admin" ? (
                          <Shield size={16} />
                        ) : (
                          <ShieldCheck size={16} />
                        )}
                      </button>

                      {/* Toggle status */}
                      <button
                        type="button"
                        onClick={() => onToggleActive(user)}
                        disabled={isLoading || isCurrentAdmin}
                        title={
                          isCurrentAdmin
                            ? "You cannot deactivate your own account"
                            : user.isActive
                              ? "Deactivate user"
                              : "Activate user"
                        }
                        aria-label={`${user.isActive ? "Deactivate" : "Activate"} ${user.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {user.isActive ? (
                          <UserX size={16} />
                        ) : (
                          <UserCheck size={16} />
                        )}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        disabled={isLoading || isCurrentAdmin}
                        title={
                          isCurrentAdmin
                            ? "You cannot delete your own account"
                            : "Delete user"
                        }
                        aria-label={`Delete ${user.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        {isLoading ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
