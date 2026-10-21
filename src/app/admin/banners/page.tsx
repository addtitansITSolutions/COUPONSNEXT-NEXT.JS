
"use client";

import { useMemo, useState } from "react";
import { Image as ImageIcon, Plus, RefreshCw } from "lucide-react";

import BannerDeleteModal from "@/components/admin/banners/BannerDeleteModal";
import BannerForm from "@/components/admin/banners/BannerForm";
import BannerPagination from "@/components/admin/banners/BannerPagination";
import BannerTable from "@/components/admin/banners/BannerTable";
import BannerTableSkeleton from "@/components/admin/banners/BannerTableSkeleton";

import BannerEmptyState from "./components/BannerEmptyState";
import BannerErrorState from "./components/BannerErrorState";
import BannerFilters from "./components/BannerFilters";

import {
  Banner,
  useBanners,
} from "@/lib/hooks/useBanners";

import { toast } from "@/components/ui/toast/toast";

export default function BannersPage() {
  const {
    banners,
    pagination,
    filters,
    loading,
    error,
    setSearch,
    setStore,
    setIsActive,
    setCountry,
    setPage,
    setLimit,
    refresh,
    createBanner,
    updateBanner,
    deleteBanner,
    clearFilters,
  } = useBanners({
    initialLimit: 10,
  });

  const [showForm, setShowForm] = useState(false);

  const [editingBanner, setEditingBanner] =
    useState<Banner | null>(null);

  const [deletingBanner, setDeletingBanner] =
    useState<Banner | null>(null);

  const [actionLoadingId, setActionLoadingId] =
    useState<string | null>(null);

  const [formSubmitting, setFormSubmitting] =
    useState(false);

  const hasFilters = useMemo(() => {
    return (
      filters.search.trim() !== "" ||
      filters.store !== "" ||
      filters.isActive !== "" ||
      filters.country.trim() !== ""
    );
  }, [filters]);

  /*
   * Open create form
   */
  const handleCreate = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  /*
   * Open edit form
   */
  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  /*
   * Close create/edit form
   */
  const handleCloseForm = () => {
    if (formSubmitting) {
      return;
    }

    setShowForm(false);
    setEditingBanner(null);
  };

  /*
   * Create / update banner
   */
  const handleSubmitForm = async (
    formData: Record<string, unknown>
  ) => {
    try {
      setFormSubmitting(true);

      if (editingBanner) {
        await updateBanner(
          editingBanner.id,
          formData
        );

        toast.success(
          "Banner updated successfully.",
          { title: "Banner Updated" }
        );
      } else {
        await createBanner(formData);

        toast.success(
          "Banner created successfully.",
          { title: "Banner Created" }
        );
      }

      setShowForm(false);
      setEditingBanner(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : editingBanner
            ? "Unable to update banner."
            : "Unable to create banner.";

      toast.error(message, {
        title: editingBanner
          ? "Update Banner Failed"
          : "Create Banner Failed",
      });

      throw error;
    } finally {
      setFormSubmitting(false);
    }
  };

  /*
   * Open delete confirmation
   */
  const handleDelete = (banner: Banner) => {
    setDeletingBanner(banner);
  };

  /*
   * Confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!deletingBanner) {
      return;
    }

    try {
      setActionLoadingId(deletingBanner.id);

      await deleteBanner(deletingBanner.id);

      toast.success(
        "Banner deleted successfully.",
        { title: "Banner Deleted" }
      );

      setDeletingBanner(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete banner.";

      toast.error(message, {
        title: "Delete Banner Failed",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Toggle active status
   */
  const handleToggleActive = async (
    banner: Banner
  ) => {
    try {
      setActionLoadingId(banner.id);

      await updateBanner(banner.id, {
        isActive: !banner.isActive,
      });

      toast.success(
        `Banner "${banner.title}" is now ${
          banner.isActive ? "inactive" : "active"
        }.`,
        {
          title: banner.isActive
            ? "Banner Deactivated"
            : "Banner Activated",
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update banner.";

      toast.error(message, {
        title: "Update Banner Failed",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Retry loading banners
   */
  const handleRetry = async () => {
    try {
      await refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load banners.";

      toast.error(message, {
        title: "Unable to Load Banners",
      });
    }
  };

  /*
   * CREATE / EDIT FORM
   */
  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={formSubmitting}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Banners
              </button>

              <span className="text-gray-300">/</span>

              <span className="text-sm font-medium text-gray-900">
                {editingBanner
                  ? "Edit Banner"
                  : "Create Banner"}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {editingBanner
                ? "Edit Banner"
                : "Create Banner"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {editingBanner
                ? "Update the banner information and images."
                : "Create a new promotional banner for CouponsNext."}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <BannerForm
            banner={editingBanner}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            submitting={formSubmitting}
          />
        </div>
      </div>
    );
  }

  /*
   * BANNER LIST
   */
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ImageIcon
                size={21}
                className="text-[var(--brand-purple)]"
              />

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Banners
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Manage promotional banners, store destinations,
              countries and visibility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              type="button"
              onClick={handleRetry}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            {/* Add Banner */}
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              <Plus size={17} />
              Add Banner
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <BannerFilters
            filters={filters}
            onSearchChange={setSearch}
            onStoreChange={setStore}
            onIsActiveChange={setIsActive}
            onCountryChange={setCountry}
            onClear={clearFilters}
          />
        </div>

        {/* Error, loading, empty state or table */}
        {error && !loading ? (
          <BannerErrorState
            message={error}
            onRetry={handleRetry}
          />
        ) : loading && banners.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <BannerTableSkeleton />
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <BannerEmptyState
              hasFilters={hasFilters}
              onClearFilters={
                hasFilters ? clearFilters : undefined
              }
            />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="relative rounded-xl border border-gray-200 bg-white shadow-sm">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-white/50 pt-6 backdrop-blur-[1px]">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm">
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                    Updating...
                  </div>
                </div>
              )}

              <BannerTable
                banners={banners}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                actionLoadingId={actionLoadingId}
              />

              {/* Pagination */}
              <div className="rounded-b-xl border-t border-gray-200 bg-white p-4">
                <BannerPagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  limit={pagination.limit}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                  disabled={loading}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      <BannerDeleteModal
        banner={deletingBanner}
        open={!!deletingBanner}
        loading={deletingBanner?.id === actionLoadingId}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!actionLoadingId) {
            setDeletingBanner(null);
          }
        }}
      />
    </>
  );
}
