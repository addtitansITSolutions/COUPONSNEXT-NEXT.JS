"use client";
import { useCallback, useEffect, useState } from "react";
import { HardDrive, RefreshCw } from "lucide-react";
import RestoreSection, {
  type RestoreMode,
} from "./components/RestoreSection";
import BackupHistory from "./components/BackupHistory";
import BackupCard, {
  type BackupCardType,
} from "@/components/admin/backups/BackupCard";
import { toast } from "@/components/ui/toast/toast";

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

export default function BackupsPage() {
  const [downloading, setDownloading] =
    useState<BackupCardType | null>(null);

  const [isRestoring, setIsRestoring] = useState(false);

  const [backups, setBackups] = useState<SafetyBackup[]>([]);

  const [pagination, setPagination] =
    useState<BackupPagination>({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

  const [historyLoading, setHistoryLoading] = useState(true);

  const [isDeleting, setIsDeleting] = useState(false);

  /*
   * Fetch backup history
   */
    const fetchBackupHistory = useCallback(
      async (page: number = 1) => {
        try {
          setHistoryLoading(true);

          const response = await fetch(
            `/api/admin/backups/history?page=${page}&limit=10`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            }
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.message || "Unable to fetch backup history."
            );
          }

          setBackups(result.backups || []);
          setPagination(result.pagination);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Unable to fetch backup history.",
            { title: "History Loading Failed" }
          );
        } finally {
          setHistoryLoading(false);
        }
      },
      []
    );
    useEffect(() => {
      const timeoutId = window.setTimeout(() => {
        void fetchBackupHistory(1);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }, [fetchBackupHistory]);

  /*
   * Download database / uploads backup
   */
  const handleDownloadBackup = async (type: BackupCardType) => {
    if (downloading || isRestoring || isDeleting) return;

    try {
      setDownloading(type);

      const endpoint =
        type === "database"
          ? "/api/admin/backups/database"
          : "/api/admin/backups/uploads";

      const response = await fetch(endpoint, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        let message = "Unable to download backup.";

        try {
          const data = await response.json();
          message = data.message || data.error || message;
        } catch {
          // Keep default error message.
        }

        throw new Error(message);
      }

      const blob = await response.blob();

      if (!blob.size) {
        throw new Error("The downloaded backup file is empty.");
      }

      const contentDisposition = response.headers.get(
        "Content-Disposition"
      );

      const filenameMatch = contentDisposition?.match(
        /filename\*?=(?:UTF-8''|")?([^";]+)"?/i
      );

      const fallbackFilename =
        type === "database"
          ? "couponsnext-database.archive.gz"
          : "couponsnext-uploads.zip";

      const filename = filenameMatch
        ? decodeURIComponent(filenameMatch[1].replace(/"/g, ""))
        : fallbackFilename;

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      toast.success(
        type === "database"
          ? "Database backup downloaded successfully."
          : "Uploads backup downloaded successfully.",
        {
          title: "Backup Downloaded",
        }
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while downloading the backup.",
        {
          title: "Backup Download Failed",
        }
      );
    } finally {
      setDownloading(null);
    }
  };

  /*
   * Refresh page data
   */
  const handleRefresh = () => {
    if (downloading || isRestoring || isDeleting) return;

    void fetchBackupHistory(1);
  };

  /*
   * Restore uploaded database / uploads backup
   */
  async function handleRestore(
    file: File,
    passcode: string,
    mode: RestoreMode
  ): Promise<boolean> {
    const isDatabaseBackup = file.name
      .toLowerCase()
      .endsWith(".archive.gz");

    if (
      isDatabaseBackup &&
      mode === "replace" &&
      !window.confirm(
        "WARNING: This will replace your existing database. An automatic safety backup will be created first. Continue?"
      )
    ) {
      return false;
    }

    setIsRestoring(true);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("passcode", passcode);
      formData.append("mode", mode);

      const response = await fetch(
        "/api/admin/backups/restore",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to restore backup."
        );
      }

      toast.success(
        result.message || "Backup restored successfully.",
        { title: "Restore Complete" }
      );

      await fetchBackupHistory(1);

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while restoring the backup.",
        { title: "Restore Failed" }
      );

      return false;
    } finally {
      setIsRestoring(false);
    }
  }

  /*
   * Restore an existing safety backup from history
   */
  async function handleHistoryRestore(
    backupId: string,
    passcode: string,
    mode: RestoreMode,
    type: SafetyBackup["type"]
  ): Promise<boolean> {
    if (
      type === "database" &&
      mode === "replace" &&
      !window.confirm(
        "WARNING: This will replace your existing database. A fresh safety backup will be created first. Continue?"
      )
    ) {
      return false;
    }

    setIsRestoring(true);

    try {
      const response = await fetch(
        "/api/admin/backups/restore",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            backupId,
            passcode,
            mode,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to restore backup."
        );
      }

      toast.success(
        result.message || "Backup restored successfully.",
        { title: "Restore Complete" }
      );

      await fetchBackupHistory(1);

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while restoring the backup.",
        { title: "Restore Failed" }
      );

      return false;
    } finally {
      setIsRestoring(false);
    }
  }

  /*
   * Permanently delete a safety backup
   */
  async function handleDeleteBackup(
    backupId: string,
    passcode: string
  ): Promise<boolean> {
    setIsDeleting(true);

    try {
      const response = await fetch(
        "/api/admin/backups/history",
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            backupId,
            passcode,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete backup."
        );
      }

      toast.success(
        result.message || "Backup permanently deleted.",
        { title: "Backup Deleted" }
      );

      const nextPage =
        backups.length === 1 && pagination.page > 1
          ? pagination.page - 1
          : pagination.page;

      await fetchBackupHistory(nextPage);

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting the backup.",
        { title: "Delete Failed" }
      );

      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive
              size={21}
              className="text-[var(--brand-purple)]"
            />

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Backups
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Create, manage and restore your website backups.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={
            downloading !== null ||
            isRestoring ||
            isDeleting
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={historyLoading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Create Backup */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            Create Backup
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Download your database and uploaded files separately.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <BackupCard
            type="database"
            loading={downloading === "database"}
            disabled={
              downloading !== null ||
              isRestoring ||
              isDeleting
            }
            onDownload={() =>
              handleDownloadBackup("database")
            }
          />

          <BackupCard
            type="uploads"
            loading={downloading === "uploads"}
            disabled={
              downloading !== null ||
              isRestoring ||
              isDeleting
            }
            onDownload={() =>
              handleDownloadBackup("uploads")
            }
          />
        </div>
      </section>

      {/* Uploaded Backup Restore */}
      <RestoreSection
        onRestore={handleRestore}
        isRestoring={isRestoring}
      />



      {/* Backup History */}
      <BackupHistory
        backups={backups}
        pagination={pagination}
        loading={historyLoading}
        isRestoring={isRestoring}
        isDeleting={isDeleting}
        onPageChange={(page) => fetchBackupHistory(page)}
        onRestore={handleHistoryRestore}
        onDelete={handleDeleteBackup}
      />
    </div>
  );
}