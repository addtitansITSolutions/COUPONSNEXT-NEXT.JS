
"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Upload,
  RefreshCw,
  LockKeyhole,
  AlertTriangle,
  FileArchive,
  X,
  CheckCircle2,
} from "lucide-react";

export type RestoreMode = "replace" | "merge";

interface RestoreSectionProps {
  onRestore: (
    file: File,
    passcode: string,
    mode: RestoreMode
  ) => Promise<boolean>;
  isRestoring: boolean;
}

export default function RestoreSection({
  onRestore,
  isRestoring,
}: RestoreSectionProps) {
  const [restoreMode, setRestoreMode] =
    useState<RestoreMode>("replace");

  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePasscode, setRestorePasscode] = useState("");
  const [restoreComplete, setRestoreComplete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploadsBackup =
    restoreFile?.name.toLowerCase().endsWith(".zip") ?? false;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setRestoreFile(file);
    setRestoreComplete(false);

    if (file?.name.toLowerCase().endsWith(".zip")) {
      setRestoreMode("merge");
    }
  }

  function clearFile() {
    setRestoreFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!restoreFile || !restorePasscode.trim() || isRestoring) {
      return;
    }

    const isDatabaseBackup = restoreFile.name
      .toLowerCase()
      .endsWith(".archive.gz");

    const isUploadsBackup = restoreFile.name
      .toLowerCase()
      .endsWith(".zip");

    if (!isDatabaseBackup && !isUploadsBackup) {
      return;
    }

    const success = await onRestore(
      restoreFile,
      restorePasscode,
      isUploadsBackup ? "merge" : restoreMode
    );

    if (success) {
      setRestoreFile(null);
      setRestorePasscode("");
      setRestoreMode("replace");
      setRestoreComplete(true);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Restore Backup
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Restore your website using a previously downloaded backup.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
      >
        {/* Persistent Success Message */}
        {restoreComplete && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <div>
                <p className="text-sm font-semibold text-green-800">
                  Restore Complete
                </p>

                <p className="mt-1 text-sm leading-5 text-green-700">
                  Your backup has been restored successfully.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setRestoreComplete(false)}
              className="shrink-0 rounded-md p-1 text-green-700 transition hover:bg-green-100"
              aria-label="Dismiss restore success message"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Warning */}
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <p className="text-sm leading-6 text-amber-800">
            Restoring a backup can overwrite or modify existing data.
            A passcode and automatic safety backup are required before
            restoration begins.
          </p>
        </div>

        {/* File Upload */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Select Backup File
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".archive.gz,.zip"
            disabled={isRestoring}
            onChange={handleFileChange}
            className="hidden"
          />

          {!restoreFile ? (
            <button
              type="button"
              disabled={isRestoring}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={22} className="text-gray-400" />

              <span className="mt-2 text-sm font-medium text-gray-700">
                Choose a backup file
              </span>

              <span className="mt-1 text-xs text-gray-500">
                Database (.archive.gz) or Uploads (.zip)
              </span>
            </button>
          ) : (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <FileArchive
                  size={22}
                  className="shrink-0 text-[var(--brand-purple)]"
                />

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {restoreFile.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {(restoreFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isRestoring}
                onClick={clearFile}
                className="shrink-0 rounded-md p-2 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50"
                aria-label="Remove selected backup"
              >
                <X size={17} />
              </button>
            </div>
          )}
        </div>

        {/* Database Restore Mode */}
        {!isUploadsBackup && (
          <div className="mt-5">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Database Restore Mode
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => setRestoreMode("replace")}
                className={`rounded-lg border p-3 text-left transition ${
                  restoreMode === "replace"
                    ? "border-[var(--brand-purple)] bg-[var(--accent-light)]"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="text-sm font-semibold text-gray-900">
                  Replace Existing Database
                </span>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Replace the existing database with backup data.
                </p>
              </button>

              <button
                type="button"
                disabled={isRestoring}
                onClick={() => setRestoreMode("merge")}
                className={`rounded-lg border p-3 text-left transition ${
                  restoreMode === "merge"
                    ? "border-[var(--brand-purple)] bg-[var(--accent-light)]"
                    : "border-gray-200 bg-white hover:bg-gray-50"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <span className="text-sm font-semibold text-gray-900">
                  Merge with Existing Database
                </span>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Import backup records while preserving existing data
                  where possible.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Uploads Merge Information */}
        {isUploadsBackup && (
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-sm font-medium text-blue-800">
              Uploads Restore — Merge
            </p>

            <p className="mt-1 text-xs leading-5 text-blue-700">
              Existing unrelated files will be preserved. Files with
              matching paths will be replaced by the backup versions.
            </p>
          </div>
        )}

        {/* Passcode */}
        <div className="mt-5">
          <label
            htmlFor="restore-passcode"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Restore Passcode
          </label>

          <div className="relative">
            <LockKeyhole
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="restore-passcode"
              type="password"
              value={restorePasscode}
              onChange={(event) =>
                setRestorePasscode(event.target.value)
              }
              disabled={isRestoring}
              required
              autoComplete="new-password"
              placeholder="Enter restore passcode"
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* Restore Button */}
        <button
          type="submit"
          disabled={
            !restoreFile ||
            !restorePasscode.trim() ||
            isRestoring
          }
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          <RefreshCw
            size={16}
            className={isRestoring ? "animate-spin" : ""}
          />

          {isRestoring ? "Restoring Backup..." : "Restore Backup"}
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          An automatic safety backup is created before restoration.
        </p>
      </form>
    </section>
  );
}
