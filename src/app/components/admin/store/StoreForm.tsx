"use client";
import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Loader2, Save, X } from "lucide-react";
import type { Store } from "@/lib/hooks/useStores";
import { toast } from "@/components/ui/toast/toast";
import StoreImageField from "./StoreImageField";

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

type FieldErrors = Partial<Record<keyof FormState, string>>;

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

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
      : "border-gray-200 focus:border-[var(--brand-purple)] focus:ring-[var(--brand-purple)]/10"
  }`;

function createFormFromStore(store?: Store | null): FormState {
  if (!store) return { ...EMPTY_FORM };

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

function FieldError({ message, id,}: { message?: string; id?: string; }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/") && !url.startsWith("//");
}

function getLocalImageUrls(store?: Store | null): string[] {
  return [store?.logo, store?.storeBanner].filter(
    (url): url is string => Boolean(url && isLocalUpload(url))
  );
}

function isValidOptionalUrl(value: string): boolean {
  if (!value.trim()) return true;
  if (isLocalUpload(value)) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function deleteStoreImage(imageUrl: string): Promise<void> {
  // Never send external URLs or unsupported paths to the delete API.
  if (!isLocalUpload(imageUrl)) return;
  const response = await fetch("/api/admin/uploads", {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.message || "Failed to delete uploaded image.");
  }
}

async function cleanupImageUrls(urls: string[]): Promise<string[]> {
  const uniqueUrls = [...new Set(urls)].filter(isLocalUpload);

  const results = await Promise.allSettled(
    uniqueUrls.map((url) => deleteStoreImage(url))
  );

  return uniqueUrls.filter(
    (_url, index) => results[index].status === "rejected"
  );
}

export default function StoreForm({ store, onSubmit, onCancel, submitting = false }: StoreFormProps) {
  const [form, setForm] = useState<FormState>(() => createFormFromStore(store) );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!store);
  const [imageUploads, setImageUploads] = useState({ logo: false, banner: false, });
  const [saving, setSaving] = useState(false);
  const [cleaningImages, setCleaningImages] = useState(false);
  // Newly uploaded files that have not yet been committed to the store.
  const uploadedImageUrlsRef = useRef<Set<string>>(new Set());
  // Local images that were already saved when this form was opened.
  const originalImageUrlsRef = useRef<Set<string>>( new Set(getLocalImageUrls(store)) );
  // Previously saved images that were replaced or removed.
  const pendingDeleteImageUrlsRef = useRef<Set<string>>(new Set());
  // Prevent unmount cleanup from deleting images while a save is in flight.
  const saveInProgressRef = useRef(false);
  const uploadingImages = imageUploads.logo || imageUploads.banner;
  const busy = submitting || saving || uploadingImages || cleaningImages;
  const isEditMode = !!store;

  // Reset form state when switching to a different store.
  useEffect(() => {
    const temporaryUrls = [...uploadedImageUrlsRef.current];

    uploadedImageUrlsRef.current.clear();
    pendingDeleteImageUrlsRef.current.clear();
    originalImageUrlsRef.current = new Set(getLocalImageUrls(store));

    if (temporaryUrls.length) {
      void cleanupImageUrls(temporaryUrls).then((failedUrls) => {
        if (failedUrls.length) {
          console.error(
            "Some temporary images could not be deleted:",
            failedUrls
          );
        }
      });
    }

    setForm(createFormFromStore(store));
    setSlugTouched(!!store);
    setErrors({});
    setServerError(null);
    setImageUploads({ logo: false, banner: false });
    setSaving(false);
    setCleaningImages(false);
  }, [store]);

  // Load active store categories.
  useEffect(() => {
    let cancelled = false;
    async function fetchCategories() {
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
          throw new Error(data.message || "Failed to load categories.");
        }

        if (!cancelled) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Failed to load store categories:", error);

        if (!cancelled) {
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setCategoriesLoading(false);
        }
      }
    }
    void fetchCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  // Best-effort cleanup of temporary uploads when the form unmounts.
  useEffect(() => {
    return () => {
      if (saveInProgressRef.current) return;

      const temporaryUrls = [...uploadedImageUrlsRef.current];

      if (temporaryUrls.length) {
        void cleanupImageUrls(temporaryUrls).then((failedUrls) => {
          if (failedUrls.length) {
            console.error(
              "Some temporary images could not be deleted:",
              failedUrls
            );
          }
        });
      }
    };
  }, []);

  const updateField = <K extends keyof FormState>( field: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });

    setServerError(null);
  };

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

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

  const handleImageUploadingChange = ( type: "logo" | "banner", uploading: boolean ) => {
    setImageUploads((previous) => ({
      ...previous,
      [type]: uploading,
    }));
  };

  const handleImageUrlChange = ( type: "logo" | "banner", url: string ) => {
    const field = type === "logo" ? "logo" : "storeBanner";
    const previousUrl = form[field];
    if (previousUrl && previousUrl !== url) {
      // Never delete a previously saved image immediately.
      if (originalImageUrlsRef.current.has(previousUrl)) {
        pendingDeleteImageUrlsRef.current.add(previousUrl);
      }
    }

    // Track all new local uploads until a successful save or cancellation.
    if ( url && isLocalUpload(url) && !originalImageUrlsRef.current.has(url) ) {
      uploadedImageUrlsRef.current.add(url);
    }
    updateField(field, url);
  };

  const clearImageError = (field: "logo" | "storeBanner") => {
    setErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];
      return next;
    });

    setServerError(null);
  };

  const validateForm = (): boolean => {
    const nextErrors: FieldErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Store name is required.";
    } else if (form.name.trim().length > 100) {
      nextErrors.name = "Store name cannot exceed 100 characters.";
    }

    if (!form.slug.trim()) {
      nextErrors.slug = "Store slug is required.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())
    ) {
      nextErrors.slug =
        "Use lowercase letters, numbers and single hyphens between words.";
    } else if (form.slug.trim().length > 120) {
      nextErrors.slug = "Slug cannot exceed 120 characters.";
    }

    if (form.description.trim().length > 2000) {
      nextErrors.description =
        "Description cannot exceed 2000 characters.";
    }

    if (form.logo.trim() && !isValidOptionalUrl(form.logo)) {
      nextErrors.logo =
        "Enter a valid HTTP, HTTPS, or uploaded image path.";
    }

    if (
      form.storeBanner.trim() &&
      !isValidOptionalUrl(form.storeBanner)
    ) {
      nextErrors.storeBanner =
        "Enter a valid HTTP, HTTPS, or uploaded image path.";
    }

    if (
      form.websiteUrl.trim() &&
      !isValidOptionalUrl(form.websiteUrl)
    ) {
      nextErrors.websiteUrl =
        "Enter a valid website URL starting with https:// or http://.";
    }

    if (
      form.affiliateUrl.trim() &&
      !isValidOptionalUrl(form.affiliateUrl)
    ) {
      nextErrors.affiliateUrl =
        "Enter a valid affiliate URL starting with https:// or http://.";
    }

    if (
      form.country.trim() &&
      !/^[a-zA-Z]{2}$/.test(form.country.trim())
    ) {
      nextErrors.country =
        "Use a 2-letter country code, such as IN or US.";
    }

    if (
      form.sortOrder.trim() === "" ||
      !/^\d+$/.test(form.sortOrder.trim()) ||
      !Number.isSafeInteger(Number(form.sortOrder)) ||
      Number(form.sortOrder) < 0
    ) {
      nextErrors.sortOrder =
        "Enter a whole number greater than or equal to 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const cleanupAfterSuccessfulSave = async ( savedLogo: string, savedBanner: string ) => {
    const retainedUrls = new Set( [savedLogo, savedBanner].filter(Boolean) );
    // Delete saved images only if neither current image field uses them.
    const oldUrlsToDelete = [
      ...pendingDeleteImageUrlsRef.current,
    ].filter((url) => !retainedUrls.has(url));
    // Also delete newly uploaded images that were replaced or removed
    // before this save.
    const temporaryUrlsToDelete = [...uploadedImageUrlsRef.current,].filter((url) => !retainedUrls.has(url));
    const failedOldUrls = await cleanupImageUrls(oldUrlsToDelete);
    const failedTemporaryUrls = await cleanupImageUrls(temporaryUrlsToDelete);
    pendingDeleteImageUrlsRef.current = new Set(failedOldUrls);
    uploadedImageUrlsRef.current = new Set(failedTemporaryUrls);
    // Retained images are now referenced by the successfully saved record.
    retainedUrls.forEach((url) => {
      uploadedImageUrlsRef.current.delete(url);
      pendingDeleteImageUrlsRef.current.delete(url);
    });
    if (failedOldUrls.length || failedTemporaryUrls.length) {
      toast.error(
        "The store was saved, but some unused images could not be deleted. They may need cleanup later.",
        { title: "Image cleanup incomplete" }
      );
    }
  };

  const handleCancel = async () => {
    if (busy) return;
    setCleaningImages(true);
    try {
      // Only delete newly uploaded temporary images. Existing saved
      // images must remain because the database was not changed.
      const temporaryUrls = [...uploadedImageUrlsRef.current];
      const failedUrls = await cleanupImageUrls(temporaryUrls);
      uploadedImageUrlsRef.current = new Set(failedUrls);
      if (failedUrls.length) {
        toast.error(
          "Some temporary images could not be deleted. You can still close the form.",
          { title: "Image cleanup incomplete" }
        );
      }
      onCancel();
    } finally {
      setCleaningImages(false);
    }
  };

  const handleSubmit = async ( event: SubmitEvent<HTMLFormElement> ) => {
    event.preventDefault();
    if (busy) return;
    if (!validateForm()) return;
    setServerError(null);
    setSaving(true);
    saveInProgressRef.current = true;
    const savedLogo = form.logo.trim();
    const savedBanner = form.storeBanner.trim();
    try {
      // onSubmit must resolve only after the database save succeeds.
      await onSubmit({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
        logo: savedLogo,
        storeBanner: savedBanner,
        websiteUrl: form.websiteUrl.trim() || undefined,
        affiliateUrl: form.affiliateUrl.trim() || undefined,
        country: form.country.trim().toUpperCase() || undefined,
        category: form.category || undefined,
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder),
      });
      toast.success("Store saved successfully.", {
        title: isEditMode ? "Store updated" : "Store created",
      });
      // Delete old images only after the database save has succeeded.
      await cleanupAfterSuccessfulSave(savedLogo, savedBanner);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to save store.";
      setServerError(message);
      toast.error(message, { title: "Unable to save store" });
    } finally {
      saveInProgressRef.current = false;
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Store" : "Create Store"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update store information and settings."
              : "Add a new store to CouponsNext."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleCancel()}
          disabled={busy}
          aria-label="Close form"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
        >
          <X size={19} />
        </button>
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Basic information
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Store name, URL slug and description.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="store-name"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Store name <span className="text-red-500">*</span>
            </label>
            <input
              id="store-name"
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
              maxLength={100}
              placeholder="Nike"
              disabled={busy}
              aria-invalid={!!errors.name}
              className={inputClass(!!errors.name)}
            />
            <FieldError message={errors.name} />
          </div>

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
                value={form.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                maxLength={120}
                placeholder="nike"
                disabled={busy}
                aria-invalid={!!errors.slug}
                className={`min-w-0 flex-1 rounded-r-lg ${inputClass(
                  !!errors.slug
                )}`}
              />
            </div>
            <FieldError message={errors.slug} />
            {!errors.slug && (
              <p className="mt-1.5 text-xs text-gray-400">
                Lowercase letters, numbers and hyphens only.
              </p>
            )}
          </div>

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
                updateField("description", event.target.value)
              }
              maxLength={2000}
              rows={3}
              placeholder="Short description about this store..."
              disabled={busy}
              aria-invalid={!!errors.description}
              className={`${inputClass(!!errors.description)} resize-y`}
            />
            <FieldError message={errors.description} />
            {!errors.description && (
              <p className="mt-1 text-right text-xs text-gray-400">
                {form.description.length}/2000
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Store images
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Images upload automatically when selected. Replaced images are
            deleted only after the store saves successfully.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StoreImageField
            label="Store logo"
            folder="logos"
            value={form.logo}
            error={errors.logo}
            disabled={busy}
            onChange={(url) => handleImageUrlChange("logo", url)}
            onUploadingChange={(uploading) =>
              handleImageUploadingChange("logo", uploading)
            }
            onClearError={() => clearImageError("logo")}
          />

          <StoreImageField
            label="Store banner"
            folder="banners"
            value={form.storeBanner}
            error={errors.storeBanner}
            disabled={busy}
            onChange={(url) => handleImageUrlChange("banner", url)}
            onUploadingChange={(uploading) =>
              handleImageUploadingChange("banner", uploading)
            }
            onClearError={() => clearImageError("storeBanner")}
          />
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Store links
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Website and affiliate URLs for store traffic and monetization.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                updateField("websiteUrl", event.target.value)
              }
              placeholder="https://www.nike.com"
              disabled={busy}
              aria-invalid={!!errors.websiteUrl}
              className={inputClass(!!errors.websiteUrl)}
            />
            <FieldError message={errors.websiteUrl} />
          </div>

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
                updateField("affiliateUrl", event.target.value)
              }
              placeholder="https://affiliate.example.com/..."
              disabled={busy}
              aria-invalid={!!errors.affiliateUrl}
              className={inputClass(!!errors.affiliateUrl)}
            />
            <FieldError message={errors.affiliateUrl} />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Classification
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Choose the store category and target country.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                updateField("category", event.target.value)
              }
              disabled={busy || categoriesLoading}
              className={inputClass(false)}
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "No category"}
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="store-country"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <input
              id="store-country"
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
              disabled={busy}
              aria-invalid={!!errors.country}
              className={`${inputClass(!!errors.country)} uppercase`}
            />
            <FieldError message={errors.country} />
            {!errors.country && (
              <p className="mt-1.5 text-xs text-gray-400">
                Example: IN, US or GB.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-gray-100 pt-5">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Publishing settings
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Control visibility, featured placement and display order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
              disabled={busy}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-purple)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800">
                Active store
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Show this store on the website.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                updateField("isFeatured", event.target.checked)
              }
              disabled={busy}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-purple)]"
            />
            <span>
              <span className="block text-sm font-medium text-gray-800">
                Featured store
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                Highlight this store.
              </span>
            </span>
          </label>

          <div className="rounded-lg flex gap-3 border border-gray-200 p-3.5 transition hover:bg-gray-50">
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
                updateField("sortOrder", event.target.value)
              }
              disabled={busy}
              aria-invalid={!!errors.sortOrder}
              className={inputClass(!!errors.sortOrder)}
            />
            <FieldError message={errors.sortOrder} />
            {!errors.sortOrder && (
              <p className="mt-1.5 text-xs text-gray-400">
                Lower numbers appear first.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => void handleCancel()}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              {uploadingImages
                ? "Uploading images..."
                : cleaningImages
                  ? "Cleaning up images..."
                  : saving || submitting
                    ? isEditMode
                      ? "Saving changes..."
                      : "Creating store..."
                    : isEditMode
                      ? "Save changes"
                      : "Create store"}
            </>
          ) : (
            <>
              <Save size={17} />
              {isEditMode ? "Save changes" : "Create store"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}




















//old form (image module included) is commented out below for reference. It can be removed once the new form is confirmed to work correctly.
// "use client";
// import { useEffect, useState } from "react";
// import type { SubmitEvent } from "react";
// import { ImagePlus, Loader2, Save, Trash2, Upload, X } from "lucide-react";
// import type { Store } from "@/lib/hooks/useStores";
// import { toast } from "@/components/ui/toast/toast";

// interface Category {
//   id: string;
//   name: string;
//   slug: string;
// }

// interface StoreFormProps {
//   store?: Store | null;
//   onSubmit: (data: Record<string, unknown>) => Promise<void>;
//   onCancel: () => void;
//   submitting?: boolean;
// }

// interface FormState {
//   name: string;
//   slug: string;
//   description: string;
//   logo: string;
//   storeBanner: string;
//   websiteUrl: string;
//   affiliateUrl: string;
//   country: string;
//   category: string;
//   isActive: boolean;
//   isFeatured: boolean;
//   sortOrder: string;
// }

// type FieldErrors = Partial<Record<keyof FormState, string>>;

// const EMPTY_FORM: FormState = {
//   name: "",
//   slug: "",
//   description: "",
//   logo: "",
//   storeBanner: "",
//   websiteUrl: "",
//   affiliateUrl: "",
//   country: "",
//   category: "",
//   isActive: true,
//   isFeatured: false,
//   sortOrder: "0",
// };

// function createFormFromStore(store?: Store | null): FormState {
//   if (!store) return { ...EMPTY_FORM };

//   return {
//     name: store.name,
//     slug: store.slug,
//     description: store.description || "",
//     logo: store.logo || "",
//     storeBanner: store.storeBanner || "",
//     websiteUrl: store.websiteUrl || "",
//     affiliateUrl: store.affiliateUrl || "",
//     country: store.country || "",
//     category: store.category?.id || "",
//     isActive: store.isActive,
//     isFeatured: store.isFeatured,
//     sortOrder: String(store.sortOrder ?? 0),
//   };
// }

// const inputClass = (hasError: boolean) =>
//   `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50 ${
//     hasError
//       ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
//       : "border-gray-200 focus:border-[var(--brand-purple)] focus:ring-[var(--brand-purple)]/10"
//   }`;

// function FieldError({
//   message,
//   id,
// }: {
//   message?: string;
//   id?: string;
// }) {
//   if (!message) return null;

//   return (
//     <p id={id} className="mt-1.5 text-xs text-red-600" role="alert">
//       {message}
//     </p>
//   );
// }

// function isValidOptionalUrl(value: string): boolean {
//   if (!value.trim()) return true;

//   // Allow URLs returned by our own image upload API.
//   if (value.startsWith("/uploads/")) {
//     return !value.startsWith("//");
//   }

//   try {
//     const url = new URL(value.trim());
//     return url.protocol === "http:" || url.protocol === "https:";
//   } catch {
//     return false;
//   }
// }

// async function uploadStoreImage(
//   file: File,
//   folder: "logos" | "banners"
// ) {
//   const formData = new FormData();

//   formData.append("file", file);
//   formData.append("folder", folder);

//   const response = await fetch("/api/admin/uploads", {
//     method: "POST",
//     credentials: "include",
//     body: formData,
//   });

//   const data = await response.json();

//   if (!response.ok || !data.success) {
//     throw new Error(data.message || "Image upload failed.");
//   }

//   return data.image.url as string;
// }


// async function deleteStoreImage(imageUrl: string): Promise<void> {
//   const response = await fetch("/api/admin/uploads", {
//     method: "DELETE",
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ imageUrl }),
//   });

//   const data = await response.json().catch(() => null);

//   if (!response.ok || !data?.success) {
//     throw new Error(data?.message || "Failed to delete image.");
//   }
// }


// export default function StoreForm({ store, onSubmit, onCancel, submitting = false, }: StoreFormProps) {
//   const [form, setForm] = useState<FormState>(() => createFormFromStore(store) );

//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoriesLoading, setCategoriesLoading] = useState(true);
//   const [errors, setErrors] = useState<FieldErrors>({});
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [slugTouched, setSlugTouched] = useState(!!store);

//   const [logoFile, setLogoFile] = useState<File | null>(null);
//   const [bannerFile, setBannerFile] = useState<File | null>(null);
//   const [logoPreview, setLogoPreview] = useState("");
//   const [bannerPreview, setBannerPreview] = useState("");
//   const [uploading, setUploading] = useState(false);
//   const [deletingImage, setDeletingImage] = useState<"logo" | "banner" | null>(null);

//   const isEditMode = !!store;
//   const busy = submitting || uploading || deletingImage !== null;

//   useEffect(() => {
//     setForm(createFormFromStore(store));
//     setSlugTouched(!!store);
//     setErrors({});
//     setServerError(null);
//     setLogoFile(null);
//     setBannerFile(null);
//   }, [store]);

//   // Generate temporary previews for selected files.
//   // Revoke object URLs to avoid leaking browser memory.
//   useEffect(() => {
//     if (!logoFile) {
//       setLogoPreview("");
//       return;
//     }

//     const objectUrl = URL.createObjectURL(logoFile);
//     setLogoPreview(objectUrl);

//     return () => URL.revokeObjectURL(objectUrl);
//   }, [logoFile]);

//   useEffect(() => {
//     if (!bannerFile) {
//       setBannerPreview("");
//       return;
//     }

//     const objectUrl = URL.createObjectURL(bannerFile);
//     setBannerPreview(objectUrl);

//     return () => URL.revokeObjectURL(objectUrl);
//   }, [bannerFile]);

//   useEffect(() => {
//     let cancelled = false;

//     async function fetchCategories() {
//       try {
//         setCategoriesLoading(true);

//         const response = await fetch(
//           "/api/admin/categories?type=store&isActive=true&limit=100",
//           {
//             method: "GET",
//             credentials: "include",
//             cache: "no-store",
//           }
//         );

//         const data = await response.json();

//         if (!response.ok || !data.success) {
//           throw new Error(data.message || "Failed to load categories.");
//         }

//         if (!cancelled) {
//           setCategories(data.categories || []);
//         }
//       } catch (error) {
//         console.error("Failed to load store categories:", error);

//         if (!cancelled) {
//           setCategories([]);
//         }
//       } finally {
//         if (!cancelled) setCategoriesLoading(false);
//       }
//     }

//     fetchCategories();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const updateField = <K extends keyof FormState>(
//     field: K,
//     value: FormState[K]
//   ) => {
//     setForm((previous) => ({ ...previous, [field]: value }));

//     setErrors((previous) => {
//       if (!previous[field]) return previous;
//       const next = { ...previous };
//       delete next[field];
//       return next;
//     });

//     setServerError(null);
//   };

//   const generateSlug = (value: string) =>
//     value
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9\s-]/g, "")
//       .replace(/\s+/g, "-")
//       .replace(/-+/g, "-")
//       .replace(/^-|-$/g, "");

//   const handleNameChange = (value: string) => {
//     updateField("name", value);

//     if (!slugTouched) {
//       updateField("slug", generateSlug(value));
//     }
//   };

//   const handleSlugChange = (value: string) => {
//     setSlugTouched(true);
//     updateField("slug", generateSlug(value));
//   };

//   const handleImageChange = (
//     event: React.ChangeEvent<HTMLInputElement>,
//     type: "logo" | "banner"
//   ) => {
//     const file = event.target.files?.[0];

//     // Allow selecting the same file again after removing it.
//     event.target.value = "";

//     if (!file) return;

//     const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

//     if (!allowedTypes.includes(file.type)) {
//       toast.error("Choose a JPEG, PNG, or WebP image.", {
//         title: "Unsupported image",
//       });
//       return;
//     }

//     if (file.size === 0 || file.size > 5 * 1024 * 1024) {
//       toast.error("Choose a valid image no larger than 5 MB.", {
//         title: "Invalid image",
//       });
//       return;
//     }

//     if (type === "logo") {
//       setLogoFile(file);
//       setErrors((previous) => ({ ...previous, logo: undefined }));
//     } else {
//       setBannerFile(file);
//       setErrors((previous) => ({ ...previous, storeBanner: undefined }));
//     }

//     setServerError(null);
//   };

  
//   const removeImage = async (type: "logo" | "banner") => {
//     if (busy) return;

//     const imageUrl = type === "logo" ? form.logo.trim() : form.storeBanner.trim();
//     setDeletingImage(type);
//     setServerError(null);
//     try {
//       // Delete only images stored by our own upload system.
//       // External image URLs are only removed from the store reference.
//       if (imageUrl.startsWith("/uploads/")) { await deleteStoreImage(imageUrl); }

//       if (type === "logo") {
//         setLogoFile(null);
//         updateField("logo", "");
//       } else {
//         setBannerFile(null);
//         updateField("storeBanner", "");
//       }

//       toast.success("Image removed successfully.", {
//         title: "Image removed",
//       });
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to remove image.";
//         setServerError(message);
//         toast.error(message, { title: "Unable to remove image" });
//     } finally {
//       setDeletingImage(null);
//     }
//   };


//   const validateForm = (): boolean => {
//     const nextErrors: FieldErrors = {};

//     if (!form.name.trim()) {
//       nextErrors.name = "Store name is required.";
//     } else if (form.name.trim().length > 100) {
//       nextErrors.name = "Store name cannot exceed 100 characters.";
//     }

//     if (!form.slug.trim()) {
//       nextErrors.slug = "Store slug is required.";
//     } else if (
//       !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())
//     ) {
//       nextErrors.slug =
//         "Use lowercase letters, numbers and single hyphens between words.";
//     } else if (form.slug.trim().length > 120) {
//       nextErrors.slug = "Slug cannot exceed 120 characters.";
//     }

//     if (form.description.trim().length > 2000) {
//       nextErrors.description =
//         "Description cannot exceed 2000 characters.";
//     }

//     if (form.logo.trim() && !isValidOptionalUrl(form.logo)) {
//       nextErrors.logo = "Enter a valid HTTP, HTTPS, or uploaded image path.";
//     }

//     if (
//       form.storeBanner.trim() &&
//       !isValidOptionalUrl(form.storeBanner)
//     ) {
//       nextErrors.storeBanner =
//         "Enter a valid HTTP, HTTPS, or uploaded image path.";
//     }

//     if (
//       form.websiteUrl.trim() &&
//       !isValidOptionalUrl(form.websiteUrl)
//     ) {
//       nextErrors.websiteUrl =
//         "Enter a valid website URL starting with https:// or http://.";
//     }

//     if (
//       form.affiliateUrl.trim() &&
//       !isValidOptionalUrl(form.affiliateUrl)
//     ) {
//       nextErrors.affiliateUrl =
//         "Enter a valid affiliate URL starting with https:// or http://.";
//     }

//     if (
//       form.country.trim() &&
//       !/^[a-zA-Z]{2}$/.test(form.country.trim())
//     ) {
//       nextErrors.country =
//         "Use a 2-letter country code, such as IN or US.";
//     }

//     if (
//       form.sortOrder.trim() === "" ||
//       !/^\d+$/.test(form.sortOrder.trim()) ||
//       !Number.isSafeInteger(Number(form.sortOrder)) ||
//       Number(form.sortOrder) < 0
//     ) {
//       nextErrors.sortOrder =
//         "Enter a whole number greater than or equal to 0.";
//     }

//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setServerError(null);

//     if (!validateForm()) return;

//     setUploading(true);

//     try {
//       let logo = form.logo.trim();
//       let storeBanner = form.storeBanner.trim();

//       // Upload only newly selected files.
//       // Existing image URLs remain unchanged when no new file is selected.
//       if (logoFile || bannerFile) {
//         const uploads: Promise<string>[] = [];

//         if (logoFile) {
//           uploads.push(uploadStoreImage(logoFile, "logos"));                        // calling image upload function for logo file and pushing the promise to uploads array
//         }

//         if (bannerFile) {
//           uploads.push(uploadStoreImage(bannerFile, "banners"));                    // calling image upload function for banner file and pushing the promise to uploads array
//         }

//         const uploadedUrls = await Promise.all(uploads);
//         let index = 0;

//         if (logoFile) logo = uploadedUrls[index++];
//         if (bannerFile) storeBanner = uploadedUrls[index++];
//       }

//       await onSubmit({
//         name: form.name.trim(),
//         slug: form.slug.trim(),
//         description: form.description.trim() || undefined,
//         logo: logo,
//         storeBanner: storeBanner,
//         websiteUrl: form.websiteUrl.trim() || undefined,
//         affiliateUrl: form.affiliateUrl.trim() || undefined,
//         country: form.country.trim().toUpperCase() || undefined,
//         category: form.category || undefined,
//         isActive: form.isActive,
//         isFeatured: form.isFeatured,
//         sortOrder: Number(form.sortOrder),
//       });

//       toast.success("Store saved successfully.", {
//         title: isEditMode ? "Store updated" : "Store created",
//       });
//     } catch (error) {
//       const message =
//         error instanceof Error ? error.message : "Failed to save store.";

//       setServerError(message);
//       toast.error(message, { title: "Unable to save store" });
//     } finally {
//       setUploading(false);
//     }
//   };

//   const renderImageField = (
//     type: "logo" | "banner",
//     label: string
//   ) => {
//     const isLogo = type === "logo";
//     const value = isLogo ? form.logo : form.storeBanner;
//     const file = isLogo ? logoFile : bannerFile;
//     const preview = isLogo ? logoPreview : bannerPreview;
//     const error = isLogo ? errors.logo : errors.storeBanner;
//     const inputId = isLogo ? "store-logo-file" : "store-banner-file";
//     const imageUrl = preview || value;

//     return (
//       <div className="space-y-3 rounded-xl border border-gray-200 p-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">
//             {label}
//           </label>
//           <p className="mt-1 text-xs text-gray-500">
//             JPEG, PNG or WebP · Maximum 5 MB
//           </p>
//         </div>

//         {imageUrl ? (
//           <div className="relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
//             <img
//               src={imageUrl}
//               alt={`${label} preview`}
//               className={
//                 isLogo
//                   ? "h-36 w-full object-contain p-3"
//                   : "h-40 w-full object-cover"
//               }
//             />

//             {file && (
//               <span className="absolute left-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-medium text-gray-700 shadow">
//                 New image
//               </span>
//             )}

            
//             <button
//               type="button"
//               onClick={() => void removeImage(type)}
//               disabled={busy}
//               className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               {deletingImage === type ? (
//                 <>
//                   <Loader2 size={14} className="animate-spin" />
//                   Removing...
//                 </>
//               ) : (
//                 <>
//                   <Trash2 size={14} />
//                   Remove
//                 </>
//               )}
//             </button>

//           </div>
//         ) : (
//           <label
//             htmlFor={inputId}
//             className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition hover:border-[var(--brand-purple)] hover:bg-purple-50/30"
//           >
//             <ImagePlus size={28} className="text-gray-400" />
//             <span className="mt-2 text-sm font-medium text-gray-700">
//               Select {label.toLowerCase()}
//             </span>
//             <span className="mt-1 text-xs text-gray-400">
//               Choose an image from your computer
//             </span>
//           </label>
//         )}

//         <input
//           id={inputId}
//           type="file"
//           accept="image/jpeg,image/png,image/webp"
//           disabled={busy}
//           onChange={(event) => handleImageChange(event, type)}
//           className="sr-only"
//         />

//         <div className="flex flex-wrap items-center gap-2">
//           <label
//             htmlFor={inputId}
//             className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 ${
//               busy ? "pointer-events-none opacity-50" : ""
//             }`}
//           >
//             <Upload size={15} />
//             {imageUrl ? "Replace image" : "Choose image"}
//           </label>

//           {file && (
//             <span className="max-w-full truncate text-xs text-gray-500">
//               {file.name}
//             </span>
//           )}
//         </div>

//         <FieldError message={error} />
//       </div>
//     );
//   };

//   return (
//     <form onSubmit={handleSubmit} noValidate className="space-y-5">
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h2 className="text-lg font-semibold text-gray-900">
//             {isEditMode ? "Edit Store" : "Create Store"}
//           </h2>
//           <p className="mt-1 text-sm text-gray-500">
//             {isEditMode
//               ? "Update store information and settings."
//               : "Add a new store to CouponsNext."}
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={onCancel}
//           disabled={busy}
//           aria-label="Close form"
//           className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
//         >
//           <X size={19} />
//         </button>
//       </div>

//       {serverError && (
//         <div
//           role="alert"
//           className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
//         >
//           {serverError}
//         </div>
//       )}

//       <section className="space-y-4">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">
//             Basic information
//           </h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Store name, URL slug and description.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div>
//             <label htmlFor="store-name" className="mb-1.5 block text-sm font-medium text-gray-700">
//               Store name <span className="text-red-500">*</span>
//             </label>
//             <input
//               id="store-name"
//               value={form.name}
//               onChange={(event) => handleNameChange(event.target.value)}
//               maxLength={100}
//               placeholder="Nike"
//               disabled={busy}
//               aria-invalid={!!errors.name}
//               className={inputClass(!!errors.name)}
//             />
//             <FieldError message={errors.name} />
//           </div>

//           <div>
//             <label htmlFor="store-slug" className="mb-1.5 block text-sm font-medium text-gray-700">
//               Slug <span className="text-red-500">*</span>
//             </label>
//             <div className="flex">
//               <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
//                 /store/
//               </span>
//               <input
//                 id="store-slug"
//                 value={form.slug}
//                 onChange={(event) => handleSlugChange(event.target.value)}
//                 maxLength={120}
//                 placeholder="nike"
//                 disabled={busy}
//                 aria-invalid={!!errors.slug}
//                 className={`min-w-0 flex-1 rounded-r-lg ${inputClass(!!errors.slug)}`}
//               />
//             </div>
//             <FieldError message={errors.slug} />
//             {!errors.slug && (
//               <p className="mt-1.5 text-xs text-gray-400">
//                 Lowercase letters, numbers and hyphens only.
//               </p>
//             )}
//           </div>

//           <div className="md:col-span-2">
//             <label htmlFor="store-description" className="mb-1.5 block text-sm font-medium text-gray-700">
//               Description
//             </label>
//             <textarea
//               id="store-description"
//               value={form.description}
//               onChange={(event) => updateField("description", event.target.value)}
//               maxLength={2000}
//               rows={3}
//               placeholder="Short description about this store..."
//               disabled={busy}
//               aria-invalid={!!errors.description}
//               className={`${inputClass(!!errors.description)} resize-y`}
//             />
//             <FieldError message={errors.description} />
//             {!errors.description && (
//               <p className="mt-1 text-right text-xs text-gray-400">
//                 {form.description.length}/2000
//               </p>
//             )}
//           </div>
//         </div>
//       </section>

//       <section className="space-y-4 border-t border-gray-100 pt-5">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">Store images</h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Select images to upload. New images are uploaded when you save the store.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           {renderImageField("logo", "Store logo")}
//           {renderImageField("banner", "Store banner")}
//         </div>
//       </section>

//       <section className="space-y-4 border-t border-gray-100 pt-5">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">Store links</h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Website and affiliate URLs for store traffic and monetization.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div>
//             <label htmlFor="store-website" className="mb-1.5 block text-sm font-medium text-gray-700">
//               Website URL
//             </label>
//             <input
//               id="store-website"
//               type="url"
//               value={form.websiteUrl}
//               onChange={(event) => updateField("websiteUrl", event.target.value)}
//               placeholder="https://www.nike.com"
//               disabled={busy}
//               aria-invalid={!!errors.websiteUrl}
//               className={inputClass(!!errors.websiteUrl)}
//             />
//             <FieldError message={errors.websiteUrl} />
//           </div>

//           <div>
//             <label htmlFor="store-affiliate" className="mb-1.5 block text-sm font-medium text-gray-700">
//               Affiliate URL
//             </label>
//             <input
//               id="store-affiliate"
//               type="url"
//               value={form.affiliateUrl}
//               onChange={(event) => updateField("affiliateUrl", event.target.value)}
//               placeholder="https://affiliate.example.com/..."
//               disabled={busy}
//               aria-invalid={!!errors.affiliateUrl}
//               className={inputClass(!!errors.affiliateUrl)}
//             />
//             <FieldError message={errors.affiliateUrl} />
//           </div>
//         </div>
//       </section>

//       <section className="space-y-4 border-t border-gray-100 pt-5">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">Classification</h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Choose the store category and target country.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//           <div>
//             <label htmlFor="store-category" className="mb-1.5 block text-sm font-medium text-gray-700">
//               Category
//             </label>
//             <select
//               id="store-category"
//               value={form.category}
//               onChange={(event) => updateField("category", event.target.value)}
//               disabled={busy || categoriesLoading}
//               className={inputClass(false)}
//             >
//               <option value="">
//                 {categoriesLoading ? "Loading categories..." : "No category"}
//               </option>
//               {categories.map((category) => (
//                 <option key={category.id} value={category.id}>
//                   {category.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="store-country" className="mb-1.5 block text-sm font-medium text-gray-700">
//               Country
//             </label>
//             <input
//               id="store-country"
//               value={form.country}
//               onChange={(event) =>
//                 updateField(
//                   "country",
//                   event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2)
//                 )
//               }
//               placeholder="IN"
//               maxLength={2}
//               disabled={busy}
//               aria-invalid={!!errors.country}
//               className={`${inputClass(!!errors.country)} uppercase`}
//             />
//             <FieldError message={errors.country} />
//             {!errors.country && (
//               <p className="mt-1.5 text-xs text-gray-400">Example: IN, US or GB.</p>
//             )}
//           </div>
//         </div>
//       </section>

//       <section className="space-y-4 border-t border-gray-100 pt-5">
//         <div>
//           <h3 className="text-sm font-semibold text-gray-900">Publishing settings</h3>
//           <p className="mt-1 text-xs text-gray-500">
//             Control visibility, featured placement and display order.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
//           <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
//             <input
//               type="checkbox"
//               checked={form.isActive}
//               onChange={(event) => updateField("isActive", event.target.checked)}
//               disabled={busy}
//               className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-purple)]"
//             />
//             <span>
//               <span className="block text-sm font-medium text-gray-800">Active store</span>
//               <span className="mt-1 block text-xs text-gray-500">Show this store on the website.</span>
//             </span>
//           </label>

//           <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
//             <input
//               type="checkbox"
//               checked={form.isFeatured}
//               onChange={(event) => updateField("isFeatured", event.target.checked)}
//               disabled={busy}
//               className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-purple)]"
//             />
//             <span>
//               <span className="block text-sm font-medium text-gray-800">Featured store</span>
//               <span className="mt-1 block text-xs text-gray-500">Highlight this store.</span>
//             </span>
//           </label>

//           <div className="flex gap-3 rounded-lg border border-gray-200 p-3.5 transition hover:bg-gray-50">
//             <label htmlFor="store-sort-order" className="mb-1.5 block text-sm font-medium text-gray-700">
//               Sort order
//             </label>
//             <input
//               id="store-sort-order"
//               type="number"
//               min={0}
//               step={1}
//               value={form.sortOrder}
//               onChange={(event) => updateField("sortOrder", event.target.value)}
//               disabled={busy}
//               aria-invalid={!!errors.sortOrder}
//               className={inputClass(!!errors.sortOrder)}
//             />
//             <FieldError message={errors.sortOrder} />
//             {!errors.sortOrder && (
//               <p className="mt-1.5 text-xs text-gray-400">Lower numbers appear first.</p>
//             )}
//           </div>
//         </div>
//       </section>

//       <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
//         <button
//           type="button"
//           onClick={onCancel}
//           disabled={busy}
//           className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
//         >
//           Cancel
//         </button>

//         <button
//           type="submit"
//           disabled={busy}
//           className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
//         >
//           {busy ? (
//             <>
//               <Loader2 size={17} className="animate-spin" />
//               {uploading
//                 ? "Uploading images..."
//                 : isEditMode
//                   ? "Saving changes..."
//                   : "Creating store..."}
//             </>
//           ) : (
//             <>
//               <Save size={17} />
//               {isEditMode ? "Save changes" : "Create store"}
//             </>
//           )}
//         </button>
//       </div>
//     </form>
//   );
// }