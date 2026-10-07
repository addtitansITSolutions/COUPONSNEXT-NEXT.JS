"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Check,
  FileText,
  Loader2,
  Save,
  Tag,
} from "lucide-react";

import { toast } from "@/components/ui/toast/toast";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";
import type { Category } from "@/components/admin/categories/CategoryTable";

type CategoryFormBaseProps = {
  onCancel: () => void;
};

type CategoryFormCreateProps = CategoryFormBaseProps & {
  mode: "create";
  category?: null;
  onCreated: (category: Category) => void;
  onUpdated?: never;
};

type CategoryFormEditProps = CategoryFormBaseProps & {
  mode: "edit";
  category: Category;
  onCreated?: never;
  onUpdated: (category: Category) => void;
};

type CategoryFormProps = | CategoryFormCreateProps | CategoryFormEditProps;

type FormState = {
  name: string;
  slug: string;
  description: string;
  contentTypes: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
};

type FormErrors = {
  name?: string;
  slug?: string;
  description?: string;
  contentTypes?: string;
  sortOrder?: string;
  form?: string;
};

const CONTENT_TYPES = [
  {
    value: "store",
    label: "Store",
  },
  {
    value: "coupon",
    label: "Coupon",
  },
  {
    value: "blog",
    label: "Blog",
  },
];

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CategoryForm({ mode, category, onCancel, onCreated, onUpdated }: CategoryFormProps) {
  const isEditMode = mode === "edit";
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    description: "",
    contentTypes: ["store", "coupon", "blog"],
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (isEditMode && category) {
      setForm({ name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        contentTypes: category.contentTypes || [],
        isActive: category.isActive,
        isFeatured: category.isFeatured,
        sortOrder: category.sortOrder ?? 0,
      });

      setIsSlugManuallyEdited(true);
    }
  }, [isEditMode, category]);

  const handleNameChange = (value: string) => {
    setForm((current) => ({
      ...current,
      name: value,
      slug: isSlugManuallyEdited ? current.slug : createSlug(value),
    }));

    setErrors((current) => ({
      ...current,
      name: undefined,
      slug: undefined,
    }));
  };

  const handleSlugChange = (value: string) => {
    const sanitizedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-");

    setIsSlugManuallyEdited(true);

    setForm((current) => ({
      ...current,
      slug: sanitizedSlug,
    }));

    setErrors((current) => ({
      ...current,
      slug: undefined,
    }));
  };

  const handleContentTypeToggle = (type: string) => {
    setForm((current) => {
      const exists = current.contentTypes.includes(type);

      return {
        ...current,
        contentTypes: exists
          ? current.contentTypes.filter(
              (item) => item !== type
            )
          : [...current.contentTypes, type],
      };
    });

    setErrors((current) => ({
      ...current,
      contentTypes: undefined,
    }));
  };

  const validateForm = () => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Category name is required";
    } else if (form.name.trim().length > 100) {
      nextErrors.name = "Category name is too long";
    }

    if (!form.slug.trim()) {
      nextErrors.slug = "Category slug is required";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())
    ) {
      nextErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (form.description.trim().length > 1000) {
      nextErrors.description = "Description is too long";
    }

    if (form.contentTypes.length === 0) {
      nextErrors.contentTypes =
        "Select at least one content type";
    }

    if (
      !Number.isInteger(form.sortOrder) ||
      form.sortOrder < 0
    ) {
      nextErrors.sortOrder =
        "Sort order must be a whole number greater than or equal to 0";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async ( event: React.SubmitEvent<HTMLFormElement> ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setErrors({});

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      contentTypes: form.contentTypes,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sortOrder: form.sortOrder,
    };

    try {
      const url = isEditMode && category ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
      const method = isEditMode ? "PATCH" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = getApiErrorMessageOnUi(
          data,
          isEditMode ? "Unable to update category." : "Unable to create category."
        );

        const fieldErrors: FormErrors = {};

        if (
          data.details &&
          typeof data.details === "object"
        ) {
          if (Array.isArray(data.details.name)) {
            fieldErrors.name = data.details.name[0];
          }

          if (Array.isArray(data.details.slug)) {
            fieldErrors.slug = data.details.slug[0];
          }

          if (Array.isArray(data.details.description)) {
            fieldErrors.description =
              data.details.description[0];
          }

          if (Array.isArray(data.details.contentTypes)) {
            fieldErrors.contentTypes =
              data.details.contentTypes[0];
          }

          if (Array.isArray(data.details.sortOrder)) {
            fieldErrors.sortOrder =
              data.details.sortOrder[0];
          }
        }

        fieldErrors.form = message;

        setErrors(fieldErrors);
        toast.error(message);

        return;
      }

      if (!data.success || !data.category) {
        const message = isEditMode ? "Category could not be updated." : "Category could not be created.";

        setErrors({
          form: message,
        });

        toast.error(message);

        return;
      }

      if (isEditMode) {
        toast.success( data.message || "Category updated successfully" );
        onUpdated(data.category);
      } else {
        toast.success( data.message || "Category created successfully" );
        onCreated(data.category);
      }
    } catch {
      const message = "Something went wrong. Please check your connection and try again.";
      setErrors({ form: message, });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--brand-navy)]/65 transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--brand-navy)]">
              {isEditMode
                ? "Edit Category"
                : "Add Category"}
            </h1>

            <p className="mt-1 text-sm text-[var(--brand-navy)]/55">
              {isEditMode
                ? "Update category details and settings."
                : "Create a new category for stores, coupons, or blogs."}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm"
      >
        {/* Form error */}
        {errors.form && (
          <div className="border-b border-red-100 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-700">
              {errors.form}
            </p>
          </div>
        )}

        <div className="space-y-8 p-5 sm:p-6 lg:p-8">
          {/* Basic information */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--brand-purple)]">
                <Tag size={18} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[var(--brand-navy)]">
                  Basic Information
                </h2>
                <p className="text-xs text-[var(--brand-navy)]/50">
                  Define the category name and URL.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium text-[var(--brand-navy)]"
                >
                  Category Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    handleNameChange(event.target.value)
                  }
                  placeholder="e.g. Electronics"
                  disabled={isSubmitting}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/35 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.name
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-[var(--border)] focus:border-[var(--brand-purple)] focus:ring-[var(--brand-purple)]/10"
                  }`}
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
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="category-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) =>
                    handleSlugChange(event.target.value)
                  }
                  placeholder="e.g. electronics"
                  disabled={isSubmitting}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/35 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.slug
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-[var(--border)] focus:border-[var(--brand-purple)] focus:ring-[var(--brand-purple)]/10"
                  }`}
                />

                {errors.slug ? (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.slug}
                  </p>
                ) : (
                  <p className="mt-1.5 text-xs text-[var(--brand-navy)]/40">
                    Lowercase letters, numbers, and hyphens only.
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-5">
              <label
                htmlFor="category-description"
                className="mb-2 block text-sm font-medium text-[var(--brand-navy)]"
              >
                Description
              </label>

              <textarea
                id="category-description"
                value={form.description}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }));

                  setErrors((current) => ({
                    ...current,
                    description: undefined,
                  }));
                }}
                placeholder="Briefly describe this category..."
                rows={4}
                disabled={isSubmitting}
                className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/35 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                  errors.description
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                    : "border-[var(--border)] focus:border-[var(--brand-purple)] focus:ring-[var(--brand-purple)]/10"
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
          </div>

          {/* Content types */}
          <div className="border-t border-[var(--border)] pt-8">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--brand-purple)]">
                <FileText size={18} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-[var(--brand-navy)]">
                  Content Types
                </h2>

                <p className="text-xs text-[var(--brand-navy)]/50">
                  Choose where this category can be used.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {CONTENT_TYPES.map((type) => {
                const isSelected =
                  form.contentTypes.includes(type.value);

                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      handleContentTypeToggle(type.value)
                    }
                    disabled={isSubmitting}
                    className={`flex min-h-14 items-center justify-between rounded-xl border px-4 text-left transition ${
                      isSelected
                        ? "border-[var(--brand-purple)] bg-[var(--accent-light)]"
                        : "border-[var(--border)] bg-white hover:border-[var(--brand-purple)]/40 hover:bg-[var(--accent-light)]/40"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span
                      className={`text-sm font-medium ${
                        isSelected
                          ? "text-[var(--brand-purple)]"
                          : "text-[var(--brand-navy)]/70"
                      }`}
                    >
                      {type.label}
                    </span>

                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                        isSelected
                          ? "border-[var(--brand-purple)] bg-[var(--brand-purple)] text-white"
                          : "border-[var(--border)] bg-white"
                      }`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            {errors.contentTypes && (
              <p className="mt-2 text-xs text-red-600">
                {errors.contentTypes}
              </p>
            )}
          </div>

          {/* Settings */}
          <div className="border-t border-[var(--border)] pt-8">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-[var(--brand-navy)]">
                Category Settings
              </h2>

              <p className="mt-1 text-xs text-[var(--brand-navy)]/50">
                Control visibility and category ordering.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {/* Active */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--brand-navy)]">
                    Active
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--brand-navy)]/45">
                    Make category visible
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-[var(--brand-purple)]"
                />
              </label>

              {/* Featured */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--brand-navy)]">
                    Featured
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--brand-navy)]/45">
                    Highlight this category
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      isFeatured: event.target.checked,
                    }))
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-[var(--brand-purple)]"
                />
              </label>

              {/* Sort order */}
              <div className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
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
                  step={1}
                  value={form.sortOrder}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    setForm((current) => ({
                      ...current,
                      sortOrder: Number.isNaN(value)
                        ? 0
                        : value,
                    }));

                    setErrors((current) => ({
                      ...current,
                      sortOrder: undefined,
                    }));
                  }}
                  disabled={isSubmitting}
                  className={`h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-[var(--brand-navy)] outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                    errors.sortOrder
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                      : "border-[var(--border)] focus:border-[var(--brand-purple)] focus:ring-[var(--brand-purple)]/10"
                  }`}
                />

                {errors.sortOrder && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.sortOrder}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] bg-[var(--background)] px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--brand-navy)]/70 transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                {isEditMode
                  ? "Updating..."
                  : "Creating..."}
              </>
            ) : (
              <>
                <Save size={17} />
                {isEditMode
                  ? "Update Category"
                  : "Create Category"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}