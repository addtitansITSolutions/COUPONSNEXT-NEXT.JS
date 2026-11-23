
"use client";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface UserErrorStateProps {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}

export default function UserErrorState({
  message,
  onRetry,
  retrying = false,
}: UserErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-white px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle size={23} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-gray-900">
        Unable to load users
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {message ||
          "Something went wrong while loading users. Please try again."}
      </p>

      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          size={15}
          className={retrying ? "animate-spin" : ""}
        />
        {retrying ? "Retrying..." : "Try again"}
      </button>
    </div>
  );
}
