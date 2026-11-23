
import {
  Database,
  FolderArchive,
  Download,
  RefreshCw,
} from "lucide-react";

export type BackupCardType = "database" | "uploads";

type BackupCardProps = {
  type: BackupCardType;
  loading: boolean;
  disabled?: boolean;
  onDownload: () => void;
};

export default function BackupCard({
  type,
  loading,
  disabled = false,
  onDownload,
}: BackupCardProps) {
  const isDatabase = type === "database";

  const Icon = isDatabase ? Database : FolderArchive;

  const title = isDatabase
    ? "Database Backup"
    : "Uploads Backup";

  const description = isDatabase
    ? "Download your complete MongoDB database, including stores, coupons, categories, blogs and users."
    : "Download all uploaded images and files, including logos, coupons, banners and blog images.";

  const format = isDatabase ? ".archive.gz" : ".zip";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-lg ${
            isDatabase
              ? "bg-purple-50 text-[var(--brand-purple)]"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          <Icon size={22} />
        </div>

        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
          Available
        </span>
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 min-h-[60px] text-sm leading-6 text-gray-500">
        {description}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs font-medium text-gray-500">
          Backup format
        </span>

        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          {format}
        </span>
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={disabled || loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Generating Backup...
          </>
        ) : (
          <>
            <Download size={16} />
            Download Backup
          </>
        )}
      </button>
    </div>
  );
}
