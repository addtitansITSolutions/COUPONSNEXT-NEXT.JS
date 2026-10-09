"use client";

import { useMemo, useState } from "react";
import { Plus, RefreshCw, Store as StoreIcon } from "lucide-react";

import StoreDeleteModal from "@/components/admin/store/StoreDeleteModal";
import StoreForm from "@/components/admin/store/StoreForm";
import StorePagination from "@/components/admin/store/StorePagination";
import StoreTable from "@/components/admin/store/StoreTable";

import StoreEmptyState from "./components/StoreEmptyState";
import StoreErrorState from "./components/StoreErrorState";
import StoreFilters from "./components/StoreFilters";
import StoreTableSkeleton from "@/components/admin/store/StoreTableSkeleton";

import {
  Store,
  useStores,
} from "@/lib/hooks/useStores";

import { toast } from "@/components/ui/toast/toast";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

export default function StoresPage() {
  const {
    stores,
    pagination,
    filters,
    loading,
    error,
    setSearch,
    setCategory,
    setIsActive,
    setIsFeatured,
    setCountry,
    setPage,
    setLimit,
    refresh,
    deleteStore,
    updateStore,
    clearFilters,
  } = useStores({
    initialLimit: 10,
  });

  const [showForm, setShowForm] = useState(false);

  const [editingStore, setEditingStore] =
    useState<Store | null>(null);

  const [deletingStore, setDeletingStore] =
    useState<Store | null>(null);

  const [actionLoadingId, setActionLoadingId] =
    useState<string | null>(null);

  const [formSubmitting, setFormSubmitting] =
    useState(false);

  const hasFilters = useMemo(() => {
    return (
      filters.search.trim() !== "" ||
      filters.category !== "" ||
      filters.isActive !== "" ||
      filters.isFeatured !== "" ||
      filters.country.trim() !== ""
    );
  }, [filters]);

  /*
   * Open create form
   */
  const handleCreate = () => {
    setEditingStore(null);
    setShowForm(true);
  };

  /*
   * Open edit form
   */
  const handleEdit = (store: Store) => {
    setEditingStore(store);
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
    setEditingStore(null);
  };

  /*
   * Create / update store
   */
  const handleSubmitForm = async (
    formData: Record<string, unknown>
  ) => {
    try {
      setFormSubmitting(true);

      /*
       * UPDATE
       */
      if (editingStore) {
        await updateStore(
          editingStore.id,
          formData
        );

        toast.success(
          "Store updated successfully.",
          {
            title: "Store Updated",
          }
        );

        setShowForm(false);
        setEditingStore(null);

        return;
      }

      /*
       * CREATE
       */
      const response = await fetch(
        "/api/admin/store",
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
        const message = getApiErrorMessageOnUi(
          data,
          "Unable to create store."
        );

        toast.error(message, {
          title: "Create Store Failed",
        });

        throw new Error(message);
      }

      /*
       * Refresh the list so the newly-created
       * store appears immediately.
       */
      await refresh();

      // toast.success(
      //   "Store created successfully.",
      //   {
      //     title: "Store Created",
      //   }
      // );

      setShowForm(false);
      setEditingStore(null);
    } catch (error) {
      if (editingStore && error instanceof Error) {
        toast.error(error.message, {
          title: "Update Store Failed",
        });
      }
      throw error;
    } finally {
      setFormSubmitting(false);
    }
  };

  /*
   * Open delete confirmation
   */
  const handleDelete = (store: Store) => {
    setDeletingStore(store);
  };

  /*
   * Confirm delete
   */
  const handleConfirmDelete = async () => {
    if (!deletingStore) {
      return;
    }

    try {
      setActionLoadingId(deletingStore.id);

      await deleteStore(deletingStore.id);

      toast.success(
        "Store deleted successfully.",
        {
          title: "Store Deleted",
        }
      );

      setDeletingStore(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete store.";

      toast.error(message, {
        title: "Delete Store Failed",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Toggle active status
   */
  const handleToggleActive = async (
    store: Store
  ) => {
    try {
      setActionLoadingId(store.id);

      await updateStore(store.id, {
        isActive: !store.isActive,
      });

      toast.success(
        `${store.name} is now ${
          store.isActive
            ? "inactive"
            : "active"
        }.`,
        {
          title: store.isActive
            ? "Store Deactivated"
            : "Store Activated",
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update store.";

      toast.error(message, {
        title: "Update Store Failed",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Toggle featured status
   */
  const handleToggleFeatured = async (
    store: Store
  ) => {
    try {
      setActionLoadingId(store.id);

      await updateStore(store.id, {
        isFeatured: !store.isFeatured,
      });

      toast.success(
        `${store.name} has been ${
          store.isFeatured
            ? "removed from"
            : "added to"
        } featured stores.`,
        {
          title: store.isFeatured
            ? "Removed From Featured"
            : "Added To Featured",
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update store.";

      toast.error(message, {
        title: "Update Store Failed",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /*
   * Retry loading stores
   */
  const handleRetry = async () => {
    try {
      await refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load stores.";

      toast.error(message, {
        title: "Unable to Load Stores",
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
                Stores
              </button>

              <span className="text-gray-300">
                /
              </span>

              <span className="text-sm font-medium text-gray-900">
                {editingStore
                  ? "Edit Store"
                  : "Create Store"}
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {editingStore
                ? "Edit Store"
                : "Create Store"}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {editingStore
                ? "Update the store information."
                : "Add a new store to CouponsNext."}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <StoreForm
            store={editingStore}
            onSubmit={handleSubmitForm}
            onCancel={handleCloseForm}
            submitting={formSubmitting}
          />
        </div>
      </div>
    );
  }

  /*
   * STORE LIST
   */
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <StoreIcon
                size={21}
                className="text-[var(--brand-purple)]"
              />

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Stores
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Manage stores, affiliate links,
              categories and visibility.
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
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            {/* Add Store */}
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              <Plus size={17} />
              Add Store
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <StoreFilters
            filters={filters}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onIsActiveChange={setIsActive}
            onIsFeaturedChange={
              setIsFeatured
            }
            onCountryChange={setCountry}
            onClear={clearFilters}
          />
        </div>

        {/* Error */}
        {error && !loading ? (
          <StoreErrorState
            message={error}
            onRetry={handleRetry}
          />
        ) : loading && stores.length === 0 ? (
          /*
           * Initial loading
           */
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <StoreTableSkeleton />
          </div>
        ) : stores.length === 0 ? (
          /*
           * Empty state
           */
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <StoreEmptyState
              hasFilters={hasFilters}
              onClearFilters={
                hasFilters
                  ? clearFilters
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="relative rounded-xl rounded-b-[0px] border border-gray-200 bg-white shadow-sm">
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

              <StoreTable
                stores={stores}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={
                  handleToggleActive
                }
                onToggleFeatured={
                  handleToggleFeatured
                }
                actionLoadingId={
                  actionLoadingId
                }
              />



              {/* Pagination */}
            <div className="rounded-xl rounded-b-[0px] border-b border-gray-200 bg-white p-4 shadow-sm shadow-sm">
              <StorePagination
                page={pagination.page}
                totalPages={
                  pagination.totalPages
                }
                total={pagination.total}
                limit={pagination.limit}
                hasNextPage={
                  pagination.hasNextPage
                }
                hasPreviousPage={
                  pagination.hasPreviousPage
                }
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
      <StoreDeleteModal
        store={deletingStore}
        open={!!deletingStore}
        loading={
          deletingStore?.id ===
          actionLoadingId
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!actionLoadingId) {
            setDeletingStore(null);
          }
        }}
      />
    </>
  );
}