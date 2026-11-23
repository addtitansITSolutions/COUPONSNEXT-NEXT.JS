
"use client";

import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
  ShieldCheck,
  Mail,
} from "lucide-react";

import type { User } from "@/lib/hooks/useUsers";

interface UserDeleteModalProps {
  user: User | null;
  open: boolean;
  loading?: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function UserDeleteModal({
  user,
  open,
  loading = false,
  onConfirm,
  onCancel,
}: UserDeleteModalProps) {
  if (!open || !user) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-user-title"
        className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle
                size={20}
                className="text-red-600"
              />
            </div>

            <div>
              <h2
                id="delete-user-title"
                className="text-base font-semibold text-gray-900"
              >
                Delete user
              </h2>

              <p className="mt-0.5 text-xs text-gray-500">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          <p className="text-sm leading-6 text-gray-600">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-gray-900">
              {user.name}
            </span>
            's account?
          </p>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs leading-5 text-amber-800">
              Deleting this user will permanently remove their
              account and prevent them from logging in.
              Existing activity history will be retained.
            </p>
          </div>

          {/* User information */}
          <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">
                Name
              </span>

              <span className="max-w-[220px] truncate text-sm font-medium text-gray-800">
                {user.name}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Mail size={13} />
                Email
              </span>

              <span className="max-w-[220px] truncate text-xs text-gray-600">
                {user.email}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">
                Role
              </span>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  user.role === "admin"
                    ? "bg-purple-50 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <ShieldCheck size={13} />
                {user.role === "admin" ? "Admin" : "User"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">
                Status
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

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete user
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
