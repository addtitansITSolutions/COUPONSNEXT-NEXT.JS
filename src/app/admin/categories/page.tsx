"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import CategoryDeleteModal from "@/components/admin/categories/CategoryDeleteModal";

import CategoryTable, { type Category, } from "@/components/admin/categories/CategoryTable";

import CategoryTableSkeleton from "@/components/admin/categories/CategoryTableSkeleton";

import CategoryForm from "@/components/admin/categories/CategoryForm";

const demoCategories: Category[] = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    description: "Electronics and technology",
    image: "",
    contentTypes: ["store", "coupon"],
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    name: "Fashion",
    slug: "fashion",
    description: "Fashion and clothing",
    image: "",
    contentTypes: ["store", "blog"],
    isActive: true,
    isFeatured: false,
    sortOrder: 2,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "3",
    name: "Deals",
    slug: "deals",
    description: "Latest deals and offers",
    image: "",
    contentTypes: ["coupon", "blog"],
    isActive: false,
    isFeatured: true,
    sortOrder: 3,
    createdAt: "",
    updatedAt: "",
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>(demoCategories);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isAddCategoryOpen, setIsAddCategoryOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] =
    useState<Category | null>(null);  

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleCategoryCreated = (
    category: Category
  ) => {
    setCategories((current) => [
      category,
      ...current,
    ]);

    setIsAddCategoryOpen(false);
  };

  const handleEditCategory = (
    category: Category
  ) => {
    setEditingCategory(category);
  };


  const handleCategoryDeleted = (categoryId: string) => {
  setCategories((current) =>
    current.filter(
      (category) => category.id !== categoryId
    )
  );

  setDeletingCategory(null);
};

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
   * EDIT CATEGORY
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
   * ADD CATEGORY
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

  /*
   * CATEGORY LIST
   */
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
          disabled={isLoading}
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
        <div className="border-b border-[var(--border)] p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={18}
                strokeWidth={1.9}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-navy)]/40"
              />

              <input
                type="search"
                placeholder="Search categories..."
                disabled={isLoading}
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/35 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Content Type Filter */}
            <select
              defaultValue=""
              disabled={isLoading}
              className="h-11 rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                All Content Types
              </option>

              <option value="store">
                Store
              </option>

              <option value="coupon">
                Coupon
              </option>

              <option value="blog">
                Blog
              </option>
            </select>

            {/* Status Filter */}
            <select
              defaultValue=""
              disabled={isLoading}
              className="h-11 rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                All Status
              </option>

              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>
            </select>

            {/* Filter Button */}
            <button
              type="button"
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--brand-navy)]/70 transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SlidersHorizontal size={17} />

              <span className="lg:hidden">
                Filters
              </span>
            </button>
          </div>
        </div>

        {/* Category Table */}
        {isLoading ? (
          <CategoryTableSkeleton />
        ) : (
          <CategoryTable
            categories={categories}
            onEdit={handleEditCategory}
            onDelete={(category) => {
                setDeletingCategory(category);
            }}
           />
        )}
      </div>



      {deletingCategory && (
        <CategoryDeleteModal
          category={deletingCategory}
          onCancel={() =>
            setDeletingCategory(null)
          }
          onDeleted={handleCategoryDeleted}
        />
      )}
    </div>
  );
}