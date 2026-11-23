
"use client";

import { useState } from "react";

import { HardDrive, RefreshCw } from "lucide-react";

import BackupCard, {
  BackupCardType,
} from "@/components/admin/backups/BackupCard";

import RestoreSection from "./components/RestoreSection";

import { toast } from "@/components/ui/toast/toast";

export default function BackupsPage() {
  const [downloading, setDownloading] =
    useState<BackupCardType | null>(null);

  /*
   * Download database / uploads backup
   */
  const handleDownloadBackup = async (
    type: BackupCardType
  ) => {
    if (downloading) {
      return;
    }

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

          message =
            data.message ||
            data.error ||
            message;
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
        /filename\*?=(?:UTF-8''|")?([^";]+)/
      );

      const fallbackFilename =
        type === "database"
          ? "couponsnext-database.archive.gz"
          : "couponsnext-uploads.zip";

      const filename = filenameMatch
        ? decodeURIComponent(
            filenameMatch[1].replace(/"/g, "")
          )
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
   * Retry / refresh page
   */
  const handleRefresh = () => {
    window.location.reload();
  };

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
            Create and restore your website backups.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={downloading !== null}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Backup Cards */}
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
            disabled={downloading !== null}
            onDownload={() =>
              handleDownloadBackup("database")
            }
          />

          <BackupCard
            type="uploads"
            loading={downloading === "uploads"}
            disabled={downloading !== null}
            onDownload={() =>
              handleDownloadBackup("uploads")
            }
          />
        </div>
      </section>

      {/* Restore */}
      <RestoreSection />

    </div>
  );
}
