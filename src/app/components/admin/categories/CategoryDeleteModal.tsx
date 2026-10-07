"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import { toast } from "@/components/ui/toast/toast";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

import type { Category } from "./CategoryTable";

type CategoryDeleteModalProps = {
  category: Category;
  onCancel: () => void;
  onDeleted: (categoryId: string) => void;
};

type ReferenceCounts = {
  stores?: number;
  coupons?: number;
  blogs?: number;
};

export default function CategoryDeleteModal({
  category,
  onCancel,
  onDeleted,
}: CategoryDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [referenceCounts, setReferenceCounts] = useState<ReferenceCounts | null>(null);

  const handleDelete = async () => {
    if (isDeleting) { return; }
    setIsDeleting(true);
    setDeleteError(null);
    setReferenceCounts(null);

    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "DELETE",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const message = getApiErrorMessageOnUi(
          data,
          "Unable to delete this category."
        );

        /*
         * If the backend returns reference counts,
         * keep them so we can show exactly what is
         * preventing deletion.
         */
        if ( data.details && typeof data.details === "object"
        ) {
          const details = data.details as Record< string, unknown >;

          const counts: ReferenceCounts = {};

          if (typeof details.stores === "number") {
            counts.stores = details.stores;
          }

          if (typeof details.coupons === "number") {
            counts.coupons = details.coupons;
          }

          if (typeof details.blogs === "number") {
            counts.blogs = details.blogs;
          }

          if (Object.keys(counts).length > 0) {
            setReferenceCounts(counts);
          }
        }

        setDeleteError(message);
        toast.error(message);

        return;
      }

      if (!data.success) {
        const message = data.message || "Unable to delete this category.";
        setDeleteError(message);
        toast.error(message);
        return;
      }

      toast.success( data.message || "Category deleted successfully" );
      onDeleted(category.id);
    } catch {
      const message = "Something went wrong while deleting the category. Please check your connection and try again.";
      setDeleteError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const hasReferences = referenceCounts && ((referenceCounts.stores ?? 0) > 0 || (referenceCounts.coupons ?? 0) > 0 || (referenceCounts.blogs ?? 0) > 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
        onMouseDown={(event) => {
          if ( event.target === event.currentTarget && !isDeleting ) {
            onCancel();
          }
        }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center overflow-y-auto p-4">
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
            {!deleteError ? (
              <>
                <p className="text-sm leading-6 text-[var(--brand-navy)]/65">
                  Are you sure you want to permanently delete{" "}
                  <span className="font-semibold text-[var(--brand-navy)]">
                    {category.name}
                  </span>
                  ?
                </p>

                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-xs leading-5 text-red-700">
                    This category can only be permanently
                    deleted if it is not being used by any
                    stores, coupons, or blogs.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4">
                  <p className="text-sm font-semibold text-red-800">
                    Category cannot be deleted
                  </p>

                  <p className="mt-1.5 text-sm leading-5 text-red-700">
                    {deleteError}
                  </p>
                </div>

                {hasReferences && (
                  <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--brand-navy)]/50">
                      Category is being used by
                    </p>

                    <div className="space-y-2">
                      {(referenceCounts?.stores ?? 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--brand-navy)]/65">
                            Stores
                          </span>

                          <span className="font-semibold text-[var(--brand-navy)]">
                            {referenceCounts?.stores}
                          </span>
                        </div>
                      )}

                      {(referenceCounts?.coupons ?? 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--brand-navy)]/65">
                            Coupons
                          </span>

                          <span className="font-semibold text-[var(--brand-navy)]">
                            {referenceCounts?.coupons}
                          </span>
                        </div>
                      )}

                      {(referenceCounts?.blogs ?? 0) > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-[var(--brand-navy)]/65">
                            Blogs
                          </span>

                          <span className="font-semibold text-[var(--brand-navy)]">
                            {referenceCounts?.blogs}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-xs leading-5 text-amber-700">
                    Remove this category from the related
                    content first, or deactivate the category
                    instead of permanently deleting it.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-navy)] transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteError ? "Close" : "Cancel"}
            </button>

            {!deleteError && (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}