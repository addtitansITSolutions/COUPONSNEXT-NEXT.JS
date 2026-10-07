"use client";

import {
  useState,
} from "react";

import {
  Plus,
} from "lucide-react";

import CategoryDeleteModal from "@/components/admin/categories/CategoryDeleteModal";
import CategoryTable, {
  type Category,
} from "@/components/admin/categories/CategoryTable";
import CategoryTableSkeleton from "@/components/admin/categories/CategoryTableSkeleton";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import CategoryPagination from "@/components/admin/categories/CategoryPagination";

import CategoryFilters from "./components/CategoryFilters";
import CategoryEmptyState from "./components/CategoryEmptyState";
import CategoryErrorState from "./components/CategoryErrorState";

import { useCategories } from "@/lib/hooks/useCategories";

export default function CategoriesPage() {
  /*
   * Filters
   */
  const [search, setSearch] = useState("");
  const [contentType, setContentType] =
    useState("");
  const [status, setStatus] = useState("");
  const [featured, setFeatured] =
    useState("");

  /*
   * UI state
   */
  const [isAddCategoryOpen, setIsAddCategoryOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] =
    useState<Category | null>(null);

  /*
   * Category data
   */
  const {
    categories,

    page,
    total,
    totalPages,
    limit,

    isLoading,
    isRetrying,
    fetchError,

    changePage,
    retry,

    setCategories,
  } = useCategories({
    search,
    contentType,
    status,
    featured,
  });

  /*
   * Create
   */
  const handleCategoryCreated = (
    category: Category
  ) => {
    setCategories((current) => [
      category,
      ...current,
    ]);

    setIsAddCategoryOpen(false);
  };

  /*
   * Edit
   */
  const handleEditCategory = (
    category: Category
  ) => {
    setEditingCategory(category);
  };

  /*
   * Update
   */
  const handleCategoryUpdated = (
    updatedCategory: Category
  ) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === updatedCategory.id
          ? updatedCategory
          : category
      )
    );

    setEditingCategory(null);
  };

  /*
   * Delete
   */
  const handleCategoryDeleted = (
    categoryId: string
  ) => {
    setCategories((current) =>
      current.filter(
        (category) =>
          category.id !== categoryId
      )
    );

    setDeletingCategory(null);
  };

  /*
   * Detect whether filters are active.
   */
  const hasActiveFilters =
    search.trim() !== "" ||
    contentType !== "" ||
    status !== "" ||
    featured !== "";

  /*
   * Edit screen
   */
  if (editingCategory) {
    return (
      <div className="space-y-6">
        <CategoryForm
          mode="edit"
          category={editingCategory}
          onCancel={() =>
            setEditingCategory(null)
          }
          onUpdated={handleCategoryUpdated}
        />
      </div>
    );
  }

  /*
   * Add screen
   */
  if (isAddCategoryOpen) {
    return (
      <div className="space-y-6">
        <CategoryForm
          mode="create"
          onCancel={() =>
            setIsAddCategoryOpen(false)
          }
          onCreated={handleCategoryCreated}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)]">
            Categories
          </h1>

          <p className="mt-1 text-sm text-[var(--brand-navy)]/55">
            Manage categories for stores, coupons, and blogs.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsAddCategoryOpen(true)
          }
          disabled={
            isLoading ||
            isRetrying
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <Plus
            size={18}
            strokeWidth={2.2}
          />

          Add Category
        </button>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {/* Filters */}
        <CategoryFilters
          search={search}
          contentType={contentType}
          status={status}
          featured={featured}
          isDisabled={
            isLoading ||
            isRetrying
          }
          onSearchChange={setSearch}
          onContentTypeChange={
            setContentType
          }
          onStatusChange={setStatus}
          onFeaturedChange={
            setFeatured
          }
        />

        {/* Loading */}
        {isLoading ? (
          <CategoryTableSkeleton />
        ) : fetchError ? (
          <CategoryErrorState
            message={fetchError}
            isRetrying={isRetrying}
            onRetry={retry}
          />
        ) : categories.length === 0 ? (
          <CategoryEmptyState
            hasFilters={hasActiveFilters}
            onAddCategory={() =>
              setIsAddCategoryOpen(true)
            }
          />
        ) : (
          <>
            <CategoryTable
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={(category) =>
                setDeletingCategory(category)
              }
            />

            <CategoryPagination
              page={page}
              totalPages={totalPages}
              total={total}
              limit={limit}
              isLoading={
                isLoading ||
                isRetrying
              }
              onPageChange={changePage}
            />
          </>
        )}
      </div>

      {/* Delete Modal */}
      {deletingCategory && (
        <CategoryDeleteModal
          category={deletingCategory}
          onCancel={() =>
            setDeletingCategory(null)
          }
          onDeleted={
            handleCategoryDeleted
          }
        />
      )}
    </div>
  );
}