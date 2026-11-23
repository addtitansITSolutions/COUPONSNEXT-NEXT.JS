
import { useRef, useState } from "react";

import {
  Upload,
  RefreshCw,
  LockKeyhole,
  AlertTriangle,
  FileArchive,
} from "lucide-react";

export default function RestoreSection() {
  const [restoreMode, setRestoreMode] = useState<
    "replace" | "merge"
  >("replace");

  const [restoreFile, setRestoreFile] = useState<File | null>(
    null
  );

  const [restorePasscode, setRestorePasscode] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0] ?? null;

    setRestoreFile(file);
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

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Warning */}
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <p className="text-sm leading-6 text-amber-800">
            Restoring a backup can overwrite or modify existing
            data. Passcode verification and an automatic safety
            backup will be required before restoration is enabled.
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
            accept=".archive.gz,.gz,.zip"
            disabled
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            disabled
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

          {restoreFile && (
            <p className="mt-2 text-xs text-gray-600">
              Selected: {restoreFile.name}
            </p>
          )}
        </div>

        {/* Restore Mode */}
        <div className="mt-5">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Restore Mode
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled
              onClick={() => setRestoreMode("replace")}
              className={`rounded-lg border p-3 text-left transition ${
                restoreMode === "replace"
                  ? "border-[var(--brand-purple)] bg-[var(--accent-light)]"
                  : "border-gray-200 bg-white"
              } opacity-60`}
            >
              <span className="text-sm font-semibold text-gray-900">
                Replace Existing Database
              </span>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Replace existing database collections with backup data.
              </p>
            </button>

            <button
              type="button"
              disabled
              onClick={() => setRestoreMode("merge")}
              className={`rounded-lg border p-3 text-left transition ${
                restoreMode === "merge"
                  ? "border-[var(--brand-purple)] bg-[var(--accent-light)]"
                  : "border-gray-200 bg-white"
              } opacity-60`}
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
              disabled
              placeholder="Enter restore passcode"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>

        {/* Restore Button */}
        <button
          type="button"
          disabled
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} />
          Restore Backup
        </button>

        <p className="mt-3 text-center text-xs text-gray-400">
          Restore functionality will be enabled after backend implementation.
        </p>
      </div>
    </section>
  );
}
