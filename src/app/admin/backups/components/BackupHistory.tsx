
"use client";

import { useState } from "react";

import {
  Archive,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  FileArchive,
  HardDrive,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";

import type { RestoreMode } from "./RestoreSection";

interface SafetyBackup {
  id: string;
  type: "database" | "uploads";
  filename: string;
  createdAt: string;
  sizeBytes: number;
}

interface BackupPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface BackupHistoryProps {
  backups: SafetyBackup[];
  pagination: BackupPagination;
  loading: boolean;
  isRestoring: boolean;
  isDeleting: boolean;
  onPageChange: (page: number) => void;
  onRestore: (
    backupId: string,
    passcode: string,
    mode: RestoreMode,
    type: SafetyBackup["type"]
  ) => Promise<boolean>;
  onDelete: (
    backupId: string,
    passcode: string
  ) => Promise<boolean>;
}

type BackupAction =
  | {
      type: "restore";
      backup: SafetyBackup;
    }
  | {
      type: "delete";
      backup: SafetyBackup;
    }
  | null;

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const size = bytes / Math.pow(1024, index);

  return `${size.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
}

function formatBackupDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

export default function BackupHistory({
  backups,
  pagination,
  loading,
  isRestoring,
  isDeleting,
  onPageChange,
  onRestore,
  onDelete,
}: BackupHistoryProps) {
  const [activeAction, setActiveAction] =
    useState<BackupAction>(null);

  const [passcode, setPasscode] = useState("");

  const [restoreMode, setRestoreMode] =
    useState<RestoreMode>("replace");

  const [showPasscode, setShowPasscode] = useState(false);

  const actionLoading = isRestoring || isDeleting;

  const openRestore = (backup: SafetyBackup) => {
    setPasscode("");
    setShowPasscode(false);

    setRestoreMode(
      backup.type === "database" ? "replace" : "merge"
    );

    setActiveAction({
      type: "restore",
      backup,
    });
  };

  const openDelete = (backup: SafetyBackup) => {
    setPasscode("");
    setShowPasscode(false);

    setActiveAction({
      type: "delete",
      backup,
    });
  };

  const closeModal = () => {
    if (actionLoading) return;

    setActiveAction(null);
    setPasscode("");
    setShowPasscode(false);
  };

  const handleAction = async () => {
    if (!activeAction || !passcode.trim() || actionLoading) {
      return;
    }

    if (activeAction.type === "restore") {
      const success = await onRestore(
        activeAction.backup.id,
        passcode,
        restoreMode,
        activeAction.backup.type
      );

      if (success) {
        closeModal();
      }

      return;
    }

    const success = await onDelete(
      activeAction.backup.id,
      passcode
    );

    if (success) {
      closeModal();
    }
  };

  const renderLoading = () => (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-100" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-36 rounded bg-gray-100" />
              <div className="h-3 w-48 max-w-full rounded bg-gray-100" />
            </div>

            <div className="hidden h-9 w-24 rounded-lg bg-gray-100 sm:block" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Archive
                size={18}
                className="text-[var(--brand-purple)]"
              />

              <h2 className="text-base font-semibold text-gray-900">
                Backup History
              </h2>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Manage and restore your automatic safety backups.
            </p>
          </div>

          {!loading && (
            <span className="text-xs font-medium text-gray-500">
              {pagination.total}{" "}
              {pagination.total === 1 ? "backup" : "backups"} available
            </span>
          )}
        </div>

        {/* Backup List */}
        {loading ? (
          renderLoading()
        ) : backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-5 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-gray-400 shadow-sm">
              <HardDrive size={22} />
            </div>

            <h3 className="text-sm font-semibold text-gray-800">
              No safety backups yet
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              Safety backups will appear here automatically before a restore operation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => {
              const isDatabase = backup.type === "database";

              return (
                <div
                  key={backup.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Backup Information */}
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isDatabase
                            ? "bg-purple-50 text-[var(--brand-purple)]"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {isDatabase ? (
                          <Database size={21} />
                        ) : (
                          <FileArchive size={21} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {isDatabase
                              ? "Database Backup"
                              : "Uploads Backup"}
                          </h3>

                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              isDatabase
                                ? "bg-purple-50 text-purple-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {backup.type}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {backup.filename}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            {formatBackupDate(backup.createdAt)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <HardDrive size={13} />
                            {formatFileSize(backup.sizeBytes)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2 border-t border-gray-100 pt-3 sm:border-0 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => openRestore(backup)}
                        disabled={actionLoading}
                        className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        <RotateCcw size={14} />
                        Restore
                      </button>

                      <button
                        type="button"
                        onClick={() => openDelete(backup)}
                        disabled={actionLoading}
                        title="Permanently delete backup"
                        aria-label={`Delete ${backup.filename}`}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-gray-500 sm:text-left">
              Page {pagination.page} of {pagination.totalPages}
              {" · "}
              {pagination.total} total backups
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() =>
                  onPageChange(pagination.page - 1)
                }
                disabled={
                  pagination.page <= 1 || actionLoading
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-gray-100 px-3 text-xs font-semibold text-gray-700">
                {pagination.page}
              </span>

              <button
                type="button"
                onClick={() =>
                  onPageChange(pagination.page + 1)
                }
                disabled={
                  pagination.page >= pagination.totalPages ||
                  actionLoading
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Restore / Delete Modal */}
      {activeAction && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-[2px] sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="backup-action-title"
            className="my-auto w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    activeAction.type === "delete"
                      ? "bg-red-50 text-red-600"
                      : "bg-purple-50 text-[var(--brand-purple)]"
                  }`}
                >
                  {activeAction.type === "delete" ? (
                    <Trash2 size={17} />
                  ) : (
                    <RotateCcw size={17} />
                  )}
                </div>

                <h3
                  id="backup-action-title"
                  className="text-base font-semibold text-gray-900"
                >
                  {activeAction.type === "delete"
                    ? "Delete Backup"
                    : "Restore Backup"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={actionLoading}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* Selected Backup */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                <div className="flex items-start gap-3">
                  {activeAction.backup.type === "database" ? (
                    <Database
                      size={19}
                      className="mt-0.5 shrink-0 text-[var(--brand-purple)]"
                    />
                  ) : (
                    <FileArchive
                      size={19}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                  )}

                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">
                      {activeAction.backup.type === "database"
                        ? "Database Backup"
                        : "Uploads Backup"}
                    </p>

                    <p className="mt-1 break-all text-xs text-gray-500">
                      {activeAction.backup.filename}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {formatBackupDate(
                        activeAction.backup.createdAt
                      )}
                      {" · "}
                      {formatFileSize(
                        activeAction.backup.sizeBytes
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Restore Options */}
              {activeAction.type === "restore" && (
                <div className="space-y-3">
                  {activeAction.backup.type === "database" ? (
                    <>
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-800">
                          Restore Mode
                        </label>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() =>
                              setRestoreMode("replace")
                            }
                            disabled={actionLoading}
                            className={`rounded-xl border p-3 text-left transition ${
                              restoreMode === "replace"
                                ? "border-[var(--brand-purple)] bg-purple-50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <span className="block text-sm font-semibold text-gray-900">
                              Replace
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-gray-500">
                              Replace the existing database.
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setRestoreMode("merge")
                            }
                            disabled={actionLoading}
                            className={`rounded-xl border p-3 text-left transition ${
                              restoreMode === "merge"
                                ? "border-[var(--brand-purple)] bg-purple-50"
                                : "border-gray-200 hover:bg-gray-50"
                            }`}
                          >
                            <span className="block text-sm font-semibold text-gray-900">
                              Merge
                            </span>

                            <span className="mt-1 block text-xs leading-5 text-gray-500">
                              Restore without dropping existing collections.
                            </span>
                          </button>
                        </div>
                      </div>

                      {restoreMode === "replace" && (
                        <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3">
                          <ShieldAlert
                            size={17}
                            className="mt-0.5 shrink-0 text-red-600"
                          />

                          <p className="text-xs leading-5 text-red-700">
                            Replace will drop the configured application database before restoring. A fresh safety backup will be created first.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs leading-5 text-amber-800">
                        Uploads are always restored in Merge mode. Existing files with matching paths may be overwritten; unrelated files are preserved.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Warning */}
              {activeAction.type === "delete" && (
                <div className="flex gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3">
                  <ShieldAlert
                    size={17}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <p className="text-xs leading-5 text-red-700">
                    This backup will be permanently deleted from your server. This action cannot be undone.
                  </p>
                </div>
              )}

              {/* Passcode */}
              <div className="space-y-2">
                <label
                  htmlFor="backup-restore-passcode"
                  className="block text-sm font-semibold text-gray-800"
                >
                  Restore Passcode
                </label>

                <div className="relative">
                  <input
                    id="backup-restore-passcode"
                    type={showPasscode ? "text" : "password"}
                    value={passcode}
                    onChange={(event) =>
                      setPasscode(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        void handleAction();
                      }
                    }}
                    placeholder="Enter your restore passcode"
                    autoComplete="off"
                    disabled={actionLoading}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 pr-16 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPasscode((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-800"
                  >
                    {showPasscode ? "Hide" : "Show"}
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Your restore passcode is required to authorize this action.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={actionLoading}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleAction()}
                  disabled={!passcode.trim() || actionLoading}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    activeAction.type === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[var(--brand-purple)] hover:bg-[var(--accent-hover)]"
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      Processing...
                    </>
                  ) : activeAction.type === "delete" ? (
                    <>
                      <Trash2 size={15} />
                      Permanently Delete
                    </>
                  ) : (
                    <>
                      <RotateCcw size={15} />
                      Restore Backup
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
