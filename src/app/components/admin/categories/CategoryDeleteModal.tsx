"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";
import type { Category } from "./CategoryTable";

type CategoryDeleteModalProps = {
  category: Category;
  onCancel: () => void;
  onDeleted: (categoryId: string) => void;
};

export default function CategoryDeleteModal({
  category,
  onCancel,
  onDeleted,
}: CategoryDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Dummy API delay for now.
      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      onDeleted(category.id);
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
        onMouseDown={(event) => {
          if (
            event.target === event.currentTarget &&
            !isDeleting
          ) {
            onCancel();
          }
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-category-title"
          className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-5 sm:px-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle size={21} />
              </div>

              <div>
                <h2
                  id="delete-category-title"
                  className="text-base font-bold text-[var(--brand-navy)]"
                >
                  Delete Category
                </h2>

                <p className="mt-1 text-xs text-[var(--brand-navy)]/50">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              aria-label="Close"
              className="rounded-lg p-1.5 text-[var(--brand-navy)]/40 transition hover:bg-[var(--background)] hover:text-[var(--brand-navy)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X size={19} />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-5 sm:px-6">
            <p className="text-sm leading-6 text-[var(--brand-navy)]/65">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-[var(--brand-navy)]">
                {category.name}
              </span>
              ?
            </p>

            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs leading-5 text-red-700">
                Deleting a category may affect content that uses
                it. We will check for related stores, coupons, and
                blogs when the real delete API is connected.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-navy)] transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={17} />
                  Delete Category
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}