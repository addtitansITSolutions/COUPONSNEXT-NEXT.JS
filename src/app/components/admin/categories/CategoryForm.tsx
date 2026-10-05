"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Save,
} from "lucide-react";

import type { Category } from "./CategoryTable";

type CategoryFormProps = {
  category?: Category;
  mode?: "create" | "edit";
  onCancel: () => void;
  onCreated?: (category: Category) => void;
  onUpdated?: (category: Category) => void;
};

type ContentType = "store" | "coupon" | "blog";

type FormState = {
  name: string;
  slug: string;
  description: string;
  image: string;
  contentTypes: ContentType[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  image: "",
  contentTypes: ["store", "coupon", "blog"],
  isActive: true,
  isFeatured: false,
  sortOrder: 0,
};

export default function CategoryForm({
  category,
  mode = "create",
  onCancel,
  onCreated,
  onUpdated,
}: CategoryFormProps) {
  const isEditMode = mode === "edit";

  const [form, setForm] = useState<FormState>(emptyForm);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode && category) {
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        contentTypes: [...category.contentTypes],
        isActive: category.isActive,
        isFeatured: category.isFeatured,
        sortOrder: category.sortOrder,
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [category, isEditMode]);

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: generateSlug(value),
    }));

    if (errors.name) {
      setErrors((current) => ({
        ...current,
        name: "",
      }));
    }
  };

  const handleSlugChange = (value: string) => {
    setForm((current) => ({
      ...current,
      slug: generateSlug(value),
    }));

    if (errors.slug) {
      setErrors((current) => ({
        ...current,
        slug: "",
      }));
    }
  };

  const toggleContentType = (type: ContentType) => {
    setForm((current) => {
      const exists = current.contentTypes.includes(type);

      if (exists) {
        if (current.contentTypes.length === 1) {
          return current;
        }

        return {
          ...current,
          contentTypes: current.contentTypes.filter(
            (item) => item !== type
          ),
        };
      }

      return {
        ...current,
        contentTypes: [...current.contentTypes, type],
      };
    });

    if (errors.contentTypes) {
      setErrors((current) => ({
        ...current,
        contentTypes: "",
      }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = "Category name is required";
    } else if (form.name.trim().length > 100) {
      nextErrors.name =
        "Category name cannot exceed 100 characters";
    }

    if (!form.slug.trim()) {
      nextErrors.slug = "Category slug is required";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)
    ) {
      nextErrors.slug =
        "Use lowercase letters, numbers, and hyphens only";
    }

    if (form.description.length > 1000) {
      nextErrors.description =
        "Description cannot exceed 1000 characters";
    }

    if (form.contentTypes.length === 0) {
      nextErrors.contentTypes =
        "Select at least one content type";
    }

    if (form.sortOrder < 0) {
      nextErrors.sortOrder =
        "Sort order cannot be negative";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Dummy API delay for now.
      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      const now = new Date().toISOString();

      if (isEditMode && category) {
        const updatedCategory: Category = {
          ...category,
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          image: form.image.trim(),
          contentTypes: form.contentTypes,
          isActive: form.isActive,
          isFeatured: form.isFeatured,
          sortOrder: form.sortOrder,
          updatedAt: now,
        };

        onUpdated?.(updatedCategory);

        return;
      }

      const newCategory: Category = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        contentTypes: form.contentTypes,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: form.sortOrder,
        createdAt: now,
        updatedAt: now,
      };

      onCreated?.(newCategory);
    } catch {
      setErrors({
        form: `Something went wrong while ${
          isEditMode ? "updating" : "creating"
        } the category. Please try again.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-[var(--border)] px-5 py-5 sm:px-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--brand-navy)]/55 transition hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={17} />
          Back to Categories
        </button>

        <h1 className="text-xl font-bold text-[var(--brand-navy)] sm:text-2xl">
          {isEditMode ? "Edit Category" : "Add Category"}
        </h1>

        <p className="mt-1 text-sm text-[var(--brand-navy)]/55">
          {isEditMode
            ? `Update the details for ${category?.name || "this category"}.`
            : "Create a category and choose where it can be used across CouponsNext."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6 p-5 sm:p-6 lg:p-7">
          {/* Form Error */}
          {errors.form && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errors.form}
            </div>
          )}

          {/* Basic Information */}
          <section>
            <h2 className="text-sm font-semibold text-[var(--brand-navy)]">
              Basic Information
            </h2>

            <p className="mt-1 text-xs text-[var(--brand-navy)]/45">
              Basic details used to identify the category.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium text-[var(--brand-navy)]"
                >
                  Category Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    handleNameChange(e.target.value)
                  }
                  disabled={isSubmitting}
                  placeholder="e.g. Electronics"
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/30 ${
                    errors.name
                      ? "border-red-300 focus:border-red-400"
                      : "border-[var(--border)] focus:border-[var(--brand-purple)]"
                  } disabled:cursor-not-allowed disabled:bg-gray-50`}
                />

                {errors.name && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="category-slug"
                  className="mb-2 block text-sm font-medium text-[var(--brand-navy)]"
                >
                  Slug
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="flex">
                  <span className="flex items-center rounded-l-xl border border-r-0 border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--brand-navy)]/40">
                    /
                  </span>

                  <input
                    id="category-slug"
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      handleSlugChange(e.target.value)
                    }
                    disabled={isSubmitting}
                    placeholder="electronics"
                    className={`min-w-0 flex-1 rounded-r-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/30 ${
                      errors.slug
                        ? "border-red-300 focus:border-red-400"
                        : "border-[var(--border)] focus:border-[var(--brand-purple)]"
                    } disabled:cursor-not-allowed disabled:bg-gray-50`}
                  />
                </div>

                {errors.slug && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.slug}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-medium text-[var(--brand-navy)]"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      description: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  rows={4}
                  placeholder="Briefly describe this category..."
                  className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/30 focus:border-[var(--brand-purple)] disabled:cursor-not-allowed disabled:bg-gray-50 ${
                    errors.description
                      ? "border-red-300"
                      : "border-[var(--border)]"
                  }`}
                />

                <div className="mt-1.5 flex justify-between">
                  {errors.description ? (
                    <p className="text-xs text-red-600">
                      {errors.description}
                    </p>
                  ) : (
                    <span />
                  )}

                  <span className="text-xs text-[var(--brand-navy)]/35">
                    {form.description.length}/1000
                  </span>
                </div>
              </div>

              {/* Image */}
              <div className="md:col-span-2">
                <label
                  htmlFor="category-image"
                  className="mb-2 block text-sm font-medium text-[var(--brand-navy)]"
                >
                  Image URL
                </label>

                <input
                  id="category-image"
                  type="url"
                  value={form.image}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      image: e.target.value,
                    }))
                  }
                  disabled={isSubmitting}
                  placeholder="https://example.com/category-image.jpg"
                  className="w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/30 focus:border-[var(--brand-purple)] disabled:cursor-not-allowed disabled:bg-gray-50"
                />

                <p className="mt-1.5 text-xs text-[var(--brand-navy)]/40">
                  We will connect this to the actual image upload system later.
                </p>
              </div>
            </div>
          </section>

          {/* Content Types */}
          <section className="border-t border-[var(--border)] pt-6">
            <h2 className="text-sm font-semibold text-[var(--brand-navy)]">
              Content Types
            </h2>

            <p className="mt-1 text-xs text-[var(--brand-navy)]/45">
              Choose which parts of the website can use this category.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                {
                  value: "store" as const,
                  label: "Stores",
                  description: "Store listings",
                },
                {
                  value: "coupon" as const,
                  label: "Coupons",
                  description: "Coupon & deal listings",
                },
                {
                  value: "blog" as const,
                  label: "Blogs",
                  description: "Blog articles",
                },
              ].map((type) => {
                const selected =
                  form.contentTypes.includes(type.value);

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      toggleContentType(type.value)
                    }
                    disabled={isSubmitting}
                    className={`rounded-xl border p-4 text-left transition ${
                      selected
                        ? "border-[var(--brand-purple)] bg-[var(--accent-light)]"
                        : "border-[var(--border)] bg-white hover:border-[var(--brand-purple)]/30 hover:bg-[var(--background)]"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[var(--brand-navy)]">
                          {type.label}
                        </p>

                        <p className="mt-1 text-xs text-[var(--brand-navy)]/45">
                          {type.description}
                        </p>
                      </div>

                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          selected
                            ? "border-[var(--brand-purple)] bg-[var(--brand-purple)] text-white"
                            : "border-[var(--brand-navy)]/15 bg-white"
                        }`}
                      >
                        {selected && (
                          <Check
                            size={13}
                            strokeWidth={3}
                          />
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {errors.contentTypes && (
              <p className="mt-2 text-xs text-red-600">
                {errors.contentTypes}
              </p>
            )}
          </section>

          {/* Settings */}
          <section className="border-t border-[var(--border)] pt-6">
            <h2 className="text-sm font-semibold text-[var(--brand-navy)]">
              Settings
            </h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {/* Active */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] p-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-navy)]">
                    Active Category
                  </p>

                  <p className="mt-1 text-xs text-[var(--brand-navy)]/45">
                    Make this category visible on the website.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      isActive: e.target.checked,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-[var(--brand-purple)]"
                />
              </label>

              {/* Featured */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] p-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--brand-navy)]">
                    Featured Category
                  </p>

                  <p className="mt-1 text-xs text-[var(--brand-navy)]/45">
                    Highlight this category in featured sections.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      isFeatured: e.target.checked,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-[var(--brand-purple)]"
                />
              </label>

              {/* Sort Order */}
              <div>
                <label
                  htmlFor="category-sort-order"
                  className="mb-2 block text-sm font-medium text-[var(--brand-navy)]"
                >
                  Sort Order
                </label>

                <input
                  id="category-sort-order"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                  disabled={isSubmitting}
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-[var(--brand-navy)] outline-none transition focus:border-[var(--brand-purple)] disabled:cursor-not-allowed disabled:bg-gray-50 ${
                    errors.sortOrder
                      ? "border-red-300"
                      : "border-[var(--border)]"
                  }`}
                />

                {errors.sortOrder && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.sortOrder}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-navy)] transition hover:bg-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                {isEditMode
                  ? "Saving Changes..."
                  : "Creating..."}
              </>
            ) : (
              <>
                <Save size={17} />

                {isEditMode
                  ? "Save Changes"
                  : "Create Category"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}