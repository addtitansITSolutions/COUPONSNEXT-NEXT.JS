"use client";
import { useMemo, useRef, useState } from "react";
import {
  Plus,
  RefreshCw,
  TicketPercent,
} from "lucide-react";
import CouponDeleteModal from "@/components/admin/coupons/CouponDeleteModal";
import CouponForm from "@/components/admin/coupons/CouponForm";
import CouponPagination from "@/components/admin/coupons/CouponPagination";
import CouponTable from "@/components/admin/coupons/CouponTable";
import CouponTableSkeleton from "@/components/admin/coupons/CouponTableSkeleton";
import CouponEmptyState from "./components/CouponEmptyState";
import CouponErrorState from "./components/CouponErrorState";
import CouponFilters from "./components/CouponFilters";

import {
  Coupon,
  useCoupons,
} from "@/lib/hooks/useCoupons";

import { toast } from "@/components/ui/toast/toast";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

export default function CouponsPage() {
  const {
    coupons,
    pagination,
    filters,
    loading,
    error,
    setSearch,
    setStore,
    setCategory,
    setType,
    setStatus,
    setIsActive,
    setIsFeatured,
    setIsVerified,
    setCountry,
    setPage,
    setLimit,
    refresh,
    deleteCoupon,
    updateCoupon,
    clearFilters,
  } = useCoupons({
    initialLimit: 10,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const actionInProgressRef = useRef<Set<string>>(new Set());

  const hasFilters = useMemo(() => {
    return (
      filters.search.trim() !== "" ||
      filters.store !== "" ||
      filters.category !== "" ||
      filters.type !== "" ||
      filters.status !== "" ||
      filters.isActive !== "" ||
      filters.isFeatured !== "" ||
      filters.isVerified !== "" ||
      filters.country.trim() !== ""
    );
  }, [filters]);

  // Open create form
  const handleCreate = () => {
    setEditingCoupon(null);
    setShowForm(true);
  };

  // Open edit form
  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setShowForm(true);
  };

  // Close create/edit form
  const handleCloseForm = () => {
    if (formSubmitting) {
      return;
    }
    setShowForm(false);
    setEditingCoupon(null);
  };

  // Create / update coupon
  const handleSubmitForm = async ( formData: Record<string, unknown> ) => {
    try {
      setFormSubmitting(true);

      // UPDATE
      if (editingCoupon) {
        await updateCoupon( editingCoupon.id, formData );

        toast.success("Coupon updated successfully.", {
          title: "Coupon Updated",
        });

        setShowForm(false);
        setEditingCoupon(null);

        return;
      }

       //CREATE
      const response = await fetch(
        "/api/admin/coupons",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = getApiErrorMessageOnUi( data, "Unable to create coupon." );

        toast.error(message, {
          title: "Create Coupon Failed",
        });

        throw new Error(message);
      }

    //   Refresh the list so the new coupon
    //   appears immediately.
      await refresh();
      toast.success("Coupon created successfully.", {
        title: "Coupon Created",
      });
      setShowForm(false);
      setEditingCoupon(null);
    } catch (error) {
      if (
        editingCoupon &&
        error instanceof Error
      ) {
        toast.error(error.message, {
          title: "Update Coupon Failed",
        });
      }

      throw error;
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open delete confirmation
  const handleDelete = (coupon: Coupon) => {
    setDeletingCoupon(coupon);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (!deletingCoupon) {
      return;
    }
    try {
      setActionLoadingId(deletingCoupon.id);

      await deleteCoupon(deletingCoupon.id);

      toast.success("Coupon deleted successfully.", {
        title: "Coupon Deleted",
      });
      setDeletingCoupon(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete coupon.";
      toast.error(message, {
        title: "Delete Coupon Failed",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle active status
  const handleToggleActive = async ( coupon: Coupon ) => {
    try {
      setActionLoadingId(coupon.id);
      await updateCoupon(coupon.id, {
        isActive: !coupon.isActive,
      });
      toast.success(
        `${coupon.title} is now ${ coupon.isActive ? "inactive" : "active" }.`,
        {
          title: coupon.isActive ? "Coupon Deactivated" : "Coupon Activated",
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update coupon.";
      toast.error(message, {
        title: "Update Coupon Failed",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle featured status
  // const handleToggleFeatured = async (
  //   coupon: Coupon
  // ) => {
  //   try {
  //     setActionLoadingId(coupon.id);
  //     await updateCoupon(coupon.id, {
  //       isFeatured: !coupon.isFeatured,
  //     });
  //     toast.success(
  //       `${coupon.title} has been ${ coupon.isFeatured ? "removed from" : "added to" } featured coupons.`,
  //       {
  //         title: coupon.isFeatured ? "Removed From Featured" : "Added To Featured",
  //       }
  //     );
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : "Unable to update coupon.";
  //     toast.error(message, { title: "Update Coupon Failed", });
  //   } finally {
  //     setActionLoadingId(null);
  //   }
  // };

  // // Toggle verified status
  // const handleToggleVerified = async ( coupon: Coupon ) => {
  //   try {
  //     setActionLoadingId(coupon.id);
  //     await updateCoupon(coupon.id, {
  //       isVerified: !coupon.isVerified,
  //     });
  //     toast.success(
  //       `${coupon.title} has been ${ coupon.isVerified ? "marked as unverified" : "verified" }.`,
  //       {
  //         title: coupon.isVerified ? "Verification Removed" : "Coupon Verified",
  //       }
  //     );
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : "Unable to update coupon.";
  //     toast.error(message, { title: "Update Coupon Failed" , });
  //   } finally {
  //     setActionLoadingId(null);
  //   }
  // };

  
    const handleToggleFeatured = async (coupon: Coupon) => {
      if (actionInProgressRef.current.has(coupon.id)) return;

      actionInProgressRef.current.add(coupon.id);

      try {
        setActionLoadingId(coupon.id);

        await updateCoupon(coupon.id, {
          isFeatured: !coupon.isFeatured,
        });

        toast.success(
          `${coupon.title} has been ${
            coupon.isFeatured ? "removed from" : "added to"
          } featured coupons.`,
          {
            title: coupon.isFeatured
              ? "Removed From Featured"
              : "Added To Featured",
          }
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update coupon.";

        toast.error(message, { title: "Update Coupon Failed" });
      } finally {
        actionInProgressRef.current.delete(coupon.id);
        setActionLoadingId(null);
      }
    };

    const handleToggleVerified = async (coupon: Coupon) => {
      if (actionInProgressRef.current.has(coupon.id)) return;

      actionInProgressRef.current.add(coupon.id);

      try {
        setActionLoadingId(coupon.id);

        await updateCoupon(coupon.id, {
          isVerified: !coupon.isVerified,
        });

        toast.success(
          `${coupon.title} has been ${
            coupon.isVerified ? "marked as unverified" : "verified"
          }.`,
          {
            title: coupon.isVerified
              ? "Verification Removed"
              : "Coupon Verified",
          }
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to update coupon.";

        toast.error(message, { title: "Update Coupon Failed" });
      } finally {
        actionInProgressRef.current.delete(coupon.id);
        setActionLoadingId(null);
      }
    };










  // Retry loading coupons
  const handleRetry = async () => {
    try {
      await refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load coupons.";
      toast.error(message, { title: "Unable to Load Coupons", });
    }
  };

  // CREATE / EDIT FORM
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
                Coupons
              </button>

              <span className="text-gray-300">
                /
              </span>

              <span className="text-sm font-medium text-gray-900">
                {editingCoupon
                  ? "Edit Coupon"
                  : "Create Coupon"}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {editingCoupon ? "Update the coupon information." : "Add a new coupon or deal to CouponsNext."}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <CouponForm
            coupon={editingCoupon}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            submitting={formSubmitting}
          />
        </div>
      </div>
    );
  }

  // COUPON LIST
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TicketPercent
                size={21}
                className="text-[var(--brand-purple)]"
              />

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Coupons
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Manage coupon codes, deals, affiliate
              links and visibility.
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
                className={
                  loading ? "animate-spin" : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            {/* Add Coupon */}
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              <Plus size={17} />
              Add Coupon
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <CouponFilters
            filters={filters}
            onSearchChange={setSearch}
            onStoreChange={setStore}
            onCategoryChange={setCategory}
            onTypeChange={setType}
            onStatusChange={setStatus}
            onIsActiveChange={setIsActive}
            onIsFeaturedChange={setIsFeatured}
            onIsVerifiedChange={setIsVerified}
            onCountryChange={setCountry}
            onClear={clearFilters}
          />
        </div>

        {/* Error / Loading / Empty / Table */}
        {error && !loading ? (
          <CouponErrorState message={error} onRetry={handleRetry} />
        ) : loading && coupons.length === 0 ? (
          /* Initial loading */
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CouponTableSkeleton />
          </div>
        ) : coupons.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <CouponEmptyState
              hasFilters={hasFilters}
              onClearFilters={
                hasFilters ? clearFilters : undefined
              }
            />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="relative rounded-xl rounded-b-none border border-gray-200 bg-white shadow-sm">
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

              <CouponTable
                coupons={coupons}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onToggleFeatured={handleToggleFeatured}
                onToggleVerified={handleToggleVerified}
                actionLoadingId={actionLoadingId}
              />

              {/* Pagination */}
              <div className="rounded-b-none border-b border-gray-200 bg-white p-4 shadow-sm">
                <CouponPagination
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
      <CouponDeleteModal
        coupon={deletingCoupon}
        open={!!deletingCoupon}
        loading={ deletingCoupon?.id === actionLoadingId }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!actionLoadingId) {
            setDeletingCoupon(null);
          }
        }}
      />
    </>
  );
}
