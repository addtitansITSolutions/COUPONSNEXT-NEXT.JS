"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, X } from "lucide-react";

import type { Store } from "@/lib/hooks/useStores";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface StoreFormProps {
  store?: Store | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

interface FormState {
  name: string;
  slug: string;
  description: string;
  logo: string;
  storeBanner: string;
  websiteUrl: string;
  affiliateUrl: string;
  country: string;
  category: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  description: "",
  logo: "",
  storeBanner: "",
  websiteUrl: "",
  affiliateUrl: "",
  country: "",
  category: "",
  isActive: true,
  isFeatured: false,
  sortOrder: "0",
};

function createFormFromStore(store?: Store | null): FormState {
  if (!store) {
    return EMPTY_FORM;
  }

  return {
    name: store.name,
    slug: store.slug,
    description: store.description || "",
    logo: store.logo || "",
    storeBanner: store.storeBanner || "",
    websiteUrl: store.websiteUrl || "",
    affiliateUrl: store.affiliateUrl || "",
    country: store.country || "",
    category: store.category?.id || "",
    isActive: store.isActive,
    isFeatured: store.isFeatured,
    sortOrder: String(store.sortOrder ?? 0),
  };
}

export default function StoreForm({
  store,
  onSubmit,
  onCancel,
  submitting = false,
}: StoreFormProps) {
  const [form, setForm] = useState<FormState>(
    createFormFromStore(store)
  );

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!store);

  const isEditMode = !!store;

  useEffect(() => {
    setForm(createFormFromStore(store));
    setSlugTouched(!!store);
    setError(null);
  }, [store]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);

        const response = await fetch(
          "/api/admin/categories?type=store&isActive=true&limit=100",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load categories"
          );
        }

        setCategories(data.categories || []);
      } catch (error) {
        console.error(
          "Failed to load store categories:",
          error
        );

        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    updateField("name", value);

    if (!slugTouched) {
      updateField("slug", generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);

    updateField("slug", generateSlug(value));
  };

  const handleSubmit = async (
    event: React.SubmitEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);

    const name = form.name.trim();
    const slug = form.slug.trim();

    if (!name) {
      setError("Store name is required.");
      return;
    }

    if (!slug) {
      setError("Store slug is required.");
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setError(
        "Slug can only contain lowercase letters, numbers, and hyphens."
      );
      return;
    }

    if (
      form.country.trim() &&
      !/^[a-zA-Z]{2}$/.test(form.country.trim())
    ) {
      setError("Country must be a 2-letter country code.");
      return;
    }

    const sortOrder = Number(form.sortOrder);

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setError(
        "Sort order must be a whole number greater than or equal to 0."
      );
      return;
    }

    try {
      await onSubmit({
        name,
        slug,
        description: form.description.trim() || undefined,
        logo: form.logo.trim() || undefined,
        storeBanner:
          form.storeBanner.trim() || undefined,
        websiteUrl:
          form.websiteUrl.trim() || undefined,
        affiliateUrl:
          form.affiliateUrl.trim() || undefined,
        country:
          form.country.trim().toUpperCase() || undefined,
        category: form.category || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to save store."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Store" : "Create Store"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update the store information and settings."
              : "Add a new store to CouponsNext."}
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Close form"
        >
          <X size={19} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic information */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Basic information
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Core information used to identify and display the
            store.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Name */}
          <div>
            <label
              htmlFor="store-name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Store name <span className="text-red-500">*</span>
            </label>

            <input
              id="store-name"
              type="text"
              value={form.name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              placeholder="Nike"
              maxLength={100}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="store-slug"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Slug <span className="text-red-500">*</span>
            </label>

            <div className="flex">
              <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
                /store/
              </span>

              <input
                id="store-slug"
                type="text"
                value={form.slug}
                onChange={(event) =>
                  handleSlugChange(event.target.value)
                }
                placeholder="nike"
                maxLength={120}
                disabled={submitting}
                className="min-w-0 flex-1 rounded-r-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
              />
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Lowercase letters, numbers and hyphens only.
            </p>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label
              htmlFor="store-description"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="store-description"
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Short description about this store..."
              maxLength={2000}
              rows={4}
              disabled={submitting}
              className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />

            <p className="mt-1 text-right text-xs text-gray-400">
              {form.description.length}/2000
            </p>
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Store images
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Add the logo and banner URLs for the store.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Logo */}
          <div>
            <label
              htmlFor="store-logo"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Logo URL
            </label>

            <input
              id="store-logo"
              type="url"
              value={form.logo}
              onChange={(event) =>
                updateField("logo", event.target.value)
              }
              placeholder="https://example.com/logo.png"
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          {/* Banner */}
          <div>
            <label
              htmlFor="store-banner"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Store banner URL
            </label>

            <input
              id="store-banner"
              type="url"
              value={form.storeBanner}
              onChange={(event) =>
                updateField(
                  "storeBanner",
                  event.target.value
                )
              }
              placeholder="https://example.com/banner.jpg"
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
        </div>
      </section>

      {/* URLs */}
      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Store links
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Website and affiliate URLs used for store traffic
            and monetization.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Website */}
          <div>
            <label
              htmlFor="store-website"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Website URL
            </label>

            <input
              id="store-website"
              type="url"
              value={form.websiteUrl}
              onChange={(event) =>
                updateField(
                  "websiteUrl",
                  event.target.value
                )
              }
              placeholder="https://www.nike.com"
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>

          {/* Affiliate */}
          <div>
            <label
              htmlFor="store-affiliate"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Affiliate URL
            </label>

            <input
              id="store-affiliate"
              type="url"
              value={form.affiliateUrl}
              onChange={(event) =>
                updateField(
                  "affiliateUrl",
                  event.target.value
                )
              }
              placeholder="https://affiliate.example.com/..."
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />
          </div>
        </div>
      </section>

      {/* Classification */}
      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Classification
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Assign the store to a category and country.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Category */}
          <div>
            <label
              htmlFor="store-category"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <select
              id="store-category"
              value={form.category}
              onChange={(event) =>
                updateField(
                  "category",
                  event.target.value
                )
              }
              disabled={
                submitting || categoriesLoading
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {categoriesLoading
                  ? "Loading categories..."
                  : "No category"}
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label
              htmlFor="store-country"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Country
            </label>

            <input
              id="store-country"
              type="text"
              value={form.country}
              onChange={(event) =>
                updateField(
                  "country",
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z]/g, "")
                    .slice(0, 2)
                )
              }
              placeholder="IN"
              maxLength={2}
              disabled={submitting}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm uppercase text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
            />

            <p className="mt-1 text-xs text-gray-400">
              Use a 2-letter country code, e.g. IN, US, GB.
            </p>
          </div>
        </div>
      </section>

      {/* Publishing settings */}
      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Publishing settings
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Control the store visibility and homepage
            placement.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Active */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateField(
                  "isActive",
                  event.target.checked
                )
              }
              disabled={submitting}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--brand-purple)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-800">
                Active store
              </span>

              <span className="mt-0.5 block text-xs text-gray-500">
                Allow this store to appear on the website.
              </span>
            </span>
          </label>

          {/* Featured */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                updateField(
                  "isFeatured",
                  event.target.checked
                )
              }
              disabled={submitting}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--brand-purple)]"
            />

            <span>
              <span className="block text-sm font-medium text-gray-800">
                Featured store
              </span>

              <span className="mt-0.5 block text-xs text-gray-500">
                Include this store in featured store sections.
              </span>
            </span>
          </label>
        </div>

        {/* Sort order */}
        <div className="max-w-xs">
          <label
            htmlFor="store-sort-order"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Sort order
          </label>

          <input
            id="store-sort-order"
            type="number"
            min={0}
            step={1}
            value={form.sortOrder}
            onChange={(event) =>
              updateField(
                "sortOrder",
                event.target.value
              )
            }
            disabled={submitting}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
          />

          <p className="mt-1 text-xs text-gray-400">
            Lower numbers appear first.
          </p>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2
                size={17}
                className="animate-spin"
              />
              {isEditMode
                ? "Saving changes..."
                : "Creating store..."}
            </>
          ) : (
            <>
              <Save size={17} />
              {isEditMode
                ? "Save changes"
                : "Create store"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}