"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { toast } from "@/components/ui/toast/toast";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";
import  StoreDropdown  from "./StoreDropdown";
import  CategoryDropdown  from "./CategoryDropdown";
import CouponImageField from "./CouponImageField";
type CouponStatus = "draft" | "published" | "expired";
type CouponType = "code" | "deal";
type PopulatedReference =
  | string
  | {
      id?: string;
      _id?: string;
      name?: string;
      slug?: string;
      logo?: string;
    }
  | null
  | undefined;

export type CouponRecord = {
  id?: string;
  _id?: string;
  title?: string;
  slug?: string;
  description?: string;
  type?: CouponType;
  code?: string;
  image?: string;
  store?: PopulatedReference;
  category?: PopulatedReference;
  discount?: string;
  affiliateUrl?: string;
  country?: string;
  startsAt?: string | Date | null;
  expiresAt?: string | Date | null;
  status?: CouponStatus;
  isActive?: boolean;
  isFeatured?: boolean;
  isVerified?: boolean;
  sortOrder?: number;
};

type CouponFormValues = {
  title: string;
  slug: string;
  description: string;
  type: CouponType;
  code: string;
  image: string;
  store: string;
  category: string;
  discount: string;
  affiliateUrl: string;
  country: string;
  startsAt: string;
  expiresAt: string;
  status: CouponStatus;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  sortOrder: string;
};

type CouponFormProps = {
  coupon?: CouponRecord | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
};

const inputClass = "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/15 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass = "mb-1.5 block text-sm font-medium text-[var(--foreground)]";

const sectionClass = "rounded-xl border border-[var(--border)] bg-white p-5 sm:p-6";

const emptyValues: CouponFormValues = {
  title: "",
  slug: "",
  description: "",
  type: "code",
  code: "",
  image: "",
  store: "",
  category: "",
  discount: "",
  affiliateUrl: "",
  country: "US",
  startsAt: "",
  expiresAt: "",
  status: "draft",
  isActive: true,
  isFeatured: false,
  isVerified: false,
  sortOrder: "0",
};

function getReferenceId(reference: PopulatedReference): string {
  if (!reference) return "";
  if (typeof reference === "string") return reference;

  return reference.id ?? reference._id ?? "";
}

function toDateTimeLocal(value?: string | Date | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number: number) => String(number).padStart(2, "0");
  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    "T",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
  ].join("");
}

function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/") && !url.startsWith("//");
}

function getInitialValues( coupon?: CouponRecord | null ): CouponFormValues {
  if (!coupon) return { ...emptyValues };
  return {
    title: coupon.title ?? "",
    slug: coupon.slug ?? "",
    description: coupon.description ?? "",
    type: coupon.type === "deal" ? "deal" : "code",
    code: coupon.code ?? "",
    image: coupon.image ?? "",
    store: getReferenceId(coupon.store),
    category: getReferenceId(coupon.category),
    discount: coupon.discount ?? "",
    affiliateUrl: coupon.affiliateUrl ?? "",
    country: coupon.country ?? "US",
    startsAt: toDateTimeLocal(coupon.startsAt),
    expiresAt: toDateTimeLocal(coupon.expiresAt),
    status: coupon.status ?? "draft",
    isActive: coupon.isActive ?? true,
    isFeatured: coupon.isFeatured ?? false,
    isVerified: coupon.isVerified ?? false,
    sortOrder: String(coupon.sortOrder ?? 0),
  };
}

export default function CouponForm({ coupon, onSubmit, onCancel, submitting = false }: CouponFormProps) {
  const [form, setForm] = useState<CouponFormValues>(() => getInitialValues(coupon) );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);
  const uploadedImageUrlsRef = useRef<Set<string>>(new Set());
  const pendingDeleteImageUrlsRef = useRef<Set<string>>(new Set());
  const originalImageUrlRef = useRef(coupon?.image ?? "");
  const couponIdRef = useRef(coupon?.id ?? coupon?._id ?? "");
  const isEditing = Boolean(coupon?.id ?? coupon?._id);
  const isBusy = submitting || isUploading;

  useEffect(() => {
    const nextCouponId = coupon?.id ?? coupon?._id ?? "";
    if (couponIdRef.current !== nextCouponId) {
      // Clean up temporary uploads from the previous unsaved form.
      const previousUploads = [ ...uploadedImageUrlsRef.current ];
      uploadedImageUrlsRef.current.clear();
      if (previousUploads.length) { void cleanupImageUrls(previousUploads); }
      pendingDeleteImageUrlsRef.current.clear();
    }
    couponIdRef.current = nextCouponId;
    originalImageUrlRef.current = coupon?.image ?? "";
    setForm(getInitialValues(coupon));
    setErrors({});
    setImageRemoved(false);
  }, [coupon]);

  async function cleanupImageUrls( urls: string[] ): Promise<string[]> {
    const uniqueUrls = [...new Set(urls)].filter(isLocalUpload);
    const failedUrls: string[] = [];
    for (const imageUrl of uniqueUrls) {
      try {
        const response = await fetch("/api/admin/uploads", {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl }),
        });

        if (!response.ok) {
          failedUrls.push(imageUrl);
        }
      } catch {
        failedUrls.push(imageUrl);
      }
    }

    return failedUrls;
  }

  function updateField<K extends keyof CouponFormValues>( field: K, value: CouponFormValues[K] ) {
    setForm((previous) => ({ ...previous, [field]: value, }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  // function handleImageChange(url: string) {
  //   const previousUrl = form.image;
  //   const originalUrl = originalImageUrlRef.current;
  //   // Do not delete an existing saved image until the coupon saves.
  //   if ( previousUrl && previousUrl !== url && previousUrl === originalUrl && isLocalUpload(previousUrl)) {
  //     pendingDeleteImageUrlsRef.current.add(previousUrl);
  //   }
  //   // Track newly uploaded images so unused ones can be cleaned up.
  //   if ( url && url !== originalUrl && isLocalUpload(url) ) { uploadedImageUrlsRef.current.add(url); }
  //   updateField("image", url);
  // }

  function handleImageChange(url: string) {
    const previousUrl = form.image;
    const originalUrl = originalImageUrlRef.current;

    if (
      previousUrl &&
      previousUrl !== url &&
      previousUrl === originalUrl &&
      isLocalUpload(previousUrl)
    ) {
      pendingDeleteImageUrlsRef.current.add(previousUrl);
    }

    if (url && url !== originalUrl && isLocalUpload(url)) {
      uploadedImageUrlsRef.current.add(url);
    }

    setImageRemoved(!url);
    updateField("image", url);
  }

  async function cleanupAfterSuccessfulSave(savedImage: string) {
    const retainedUrls = new Set(savedImage ? [savedImage] : []);
    const urlsToDelete = [
      ...pendingDeleteImageUrlsRef.current,
      ...uploadedImageUrlsRef.current,
    ].filter((url) => !retainedUrls.has(url));
    const failedUrls = await cleanupImageUrls(urlsToDelete);
    const failedSet = new Set(failedUrls);
    pendingDeleteImageUrlsRef.current = new Set(
      [...pendingDeleteImageUrlsRef.current].filter((url) =>
        failedSet.has(url)
      )
    );
    uploadedImageUrlsRef.current = new Set(
      [...uploadedImageUrlsRef.current].filter((url) =>
        failedSet.has(url)
      )
    );
    if (savedImage) {
      uploadedImageUrlsRef.current.delete(savedImage);
      pendingDeleteImageUrlsRef.current.delete(savedImage);
    }
    originalImageUrlRef.current = savedImage;
    if (failedUrls.length) {
      toast.error(
        "Coupon saved, but some unused images could not be deleted.",
        { title: "Image cleanup incomplete" }
      );
    }
  }

  async function cleanupTemporaryUploads() {
    const temporaryUrls = [...uploadedImageUrlsRef.current, ];
    uploadedImageUrlsRef.current.clear();
    if (temporaryUrls.length) {
      await cleanupImageUrls(temporaryUrls);
    }
  }

  // Remove unsaved temporary uploads when leaving the form.
  useEffect(() => {
    return () => {
      const urls = [...uploadedImageUrlsRef.current];
      if (urls.length) {
        void cleanupImageUrls(urls);
      }
    };
  }, []);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      nextErrors.title = "Coupon title is required.";
    } else if (form.title.trim().length > 200) {
      nextErrors.title = "Title cannot exceed 200 characters.";
    }
    if (!form.slug.trim()) {
      nextErrors.slug = "Slug is required.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())
    ) {
      nextErrors.slug =
        "Use lowercase letters, numbers, and single hyphens.";
    }
    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    } else if (form.description.trim().length > 2000) {
      nextErrors.description =
        "Description cannot exceed 2000 characters.";
    }
    if (form.type === "code" && !form.code.trim()) {
      nextErrors.code = "Coupon code is required for code coupons.";
    }
    if (form.code.length > 100) {
      nextErrors.code = "Coupon code cannot exceed 100 characters.";
    }
    if (!form.store) {
      nextErrors.store = "Please select a store.";
    }
    if (!form.affiliateUrl.trim()) {
      nextErrors.affiliateUrl = "Affiliate URL is required.";
    } else {
      try {
        const url = new URL(form.affiliateUrl.trim());
        if (!["http:", "https:"].includes(url.protocol)) {
          nextErrors.affiliateUrl = "Use a valid HTTP or HTTPS URL.";
        }
      } catch {
        nextErrors.affiliateUrl = "Enter a valid affiliate URL.";
      }
    }
    if (!/^[a-zA-Z]{2}$/.test(form.country.trim())) {
      nextErrors.country = "Enter a valid 2-letter country code.";
    }
    if (
      form.discount.trim().length > 100
    ) {
      nextErrors.discount = "Discount cannot exceed 100 characters.";
    }
    if (form.image.length > 500) {
      nextErrors.image = "Image URL cannot exceed 500 characters.";
    }
    const start = form.startsAt ? new Date(form.startsAt) : null;
    const expiry = form.expiresAt ? new Date(form.expiresAt) : null;
    if (start && Number.isNaN(start.getTime())) {
      nextErrors.startsAt = "Enter a valid start date.";
    }
    if (expiry && Number.isNaN(expiry.getTime())) {
      nextErrors.expiresAt = "Enter a valid expiry date.";
    }
    if (start && expiry && expiry <= start) {
      nextErrors.expiresAt =
        "Expiry date must be after the start date.";
    }
    const sortOrder = Number(form.sortOrder);
    if (
      form.sortOrder.trim() === "" ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      nextErrors.sortOrder =
        "Sort order must be a non-negative whole number.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Please correct the highlighted fields.");
      return false;
    }
    return true;
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isBusy) return;
    if (!validate()) return;
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      description: form.description.trim(),
      type: form.type,
      store: form.store,
      affiliateUrl: form.affiliateUrl.trim(),
      country: form.country.trim().toUpperCase(),
      status: form.status,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isVerified: form.isVerified,
      sortOrder: Number(form.sortOrder),
    };

    if (form.type === "code") {
      payload.code = form.code.trim();
    }
    if (form.image.trim()) {
      payload.image = form.image.trim();
    } else if (imageRemoved && isEditing) {
      payload.image = null;
    }
    if (form.category && form.category !== "__none__") {
      payload.category = form.category;
    }
    if (form.discount.trim()) {
      payload.discount = form.discount.trim();
    }
    if (form.startsAt) {
      payload.startsAt = new Date(form.startsAt).toISOString();
    }
    if (form.expiresAt) {
      payload.expiresAt = new Date(form.expiresAt).toISOString();
    }
    try {
      await onSubmit(payload);
      await cleanupAfterSuccessfulSave(form.image.trim());
    } catch (error : any) {
      const message =
        error instanceof Error
          ? error.message
          : getApiErrorMessageOnUi(
              error,
              isEditing
                ? "Unable to update coupon."
                : "Unable to create coupon."
            );

      // toast.error(message);
    }
  }

  function handleCancel() {
    if (isBusy) return;
    void cleanupTemporaryUploads();
    onCancel();
  }

  function handleTitleChange(value: string) {
    updateField("title", value);
    // Automatically generate the slug while creating a coupon.
    // Once the user edits the slug manually, it remains independent.
    if (!isEditing) {
      setForm((previous) => ({
        ...previous,
        title: value,
        slug: value
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      }));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Coupon" : "Create Coupon"}
          </h2>
          {/* <p className="mt-1 text-sm text-gray-500">
            {isEditMode
              ? "Update store information and settings."
              : "Add a new store to CouponsNext."}
          </p> */}
        </div>

        <button
          type="button"
          onClick={() => void handleCancel()}
          disabled={isBusy}
          aria-label="Close form"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
        >
          <X size={19} />
        </button>
      </div>



      {/* Basic information */}
      <section >
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Basic information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Add the coupon details shown on CouponsNext.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="coupon-title" className={labelClass}>
              Coupon title <span className="text-red-500">*</span>
            </label>
            <input
              id="coupon-title"
              className={inputClass}
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              maxLength={200}
              placeholder="e.g. Get 20% off your order"
              disabled={isBusy}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="coupon-slug" className={labelClass}>
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              id="coupon-slug"
              className={inputClass}
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              maxLength={220}
              placeholder="get-20-percent-off"
              disabled={isBusy}
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="coupon-description" className={labelClass}>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="coupon-description"
              className={inputClass}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              maxLength={2000}
              rows={4}
              placeholder="Describe the offer and any important conditions."
              disabled={isBusy}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">
                {errors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="coupon-type" className={labelClass}>
              Coupon type <span className="text-red-500">*</span>
            </label>
            <select
              id="coupon-type"
              className={inputClass}
              value={form.type}
              onChange={(event) => {
                const type = event.target.value as CouponType;

                updateField("type", type);

                if (type === "deal") {
                  updateField("code", "");
                }
              }}
              disabled={isBusy}
            >
              <option value="code">Code coupon</option>
              <option value="deal">Deal (no code)</option>
            </select>
          </div>

          {form.type === "code" && (
            <div>
              <label htmlFor="coupon-code" className={labelClass}>
                Coupon code <span className="text-red-500">*</span>
              </label>
              <input
                id="coupon-code"
                className={inputClass}
                value={form.code}
                onChange={(event) =>
                  updateField("code", event.target.value)
                }
                maxLength={100}
                placeholder="e.g. SAVE20"
                disabled={isBusy}
              />
              {errors.code && (
                <p className="mt-1 text-xs text-red-600">{errors.code}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="coupon-discount" className={labelClass}>
              Discount label
            </label>
            <input
              id="coupon-discount"
              className={inputClass}
              value={form.discount}
              onChange={(event) =>
                updateField("discount", event.target.value)
              }
              maxLength={100}
              placeholder="e.g. 20% OFF"
              disabled={isBusy}
            />
            {errors.discount && (
              <p className="mt-1 text-xs text-red-600">
                {errors.discount}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="coupon-country" className={labelClass}>
              Country code <span className="text-red-500">*</span>
            </label>
            <input
              id="coupon-country"
              className={inputClass}
              value={form.country}
              onChange={(event) =>
                updateField("country", event.target.value.toUpperCase())
              }
              maxLength={2}
              placeholder="US"
              disabled={isBusy}
            />
            {errors.country && (
              <p className="mt-1 text-xs text-red-600">
                {errors.country}
              </p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Use a 2-letter country code, such as US, GB, or IN.
            </p>
          </div>
        </div>
      </section>

      <div className="flex-row md:flex md:direction-col justify-between items-center ">
          {/* Coupon image */}
        <section className="min-w-1/2 pr-0 md:pr-3">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Coupon image
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Upload or replace the image used for this coupon.
            </p>
          </div>

          <div className="max-w-full">
            <CouponImageField
              value={form.image}
              error={errors.image}
              disabled={submitting}
              onChange={handleImageChange}
              onUploadingChange={setIsUploading}
              onClearError={() =>
                setErrors((previous) => {
                  const next = { ...previous };
                  delete next.image;
                  return next;
                })
              }
            />
          </div>

          {errors.image && (
            <p className="mt-2 text-xs text-red-600">{errors.image}</p>
          )}
        </section>

        {/* Store, category and affiliate */}
        <section className="min-w-1/2 pl-0 pt-3 md:pl-3 md:pt-0">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Store and classification
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Link the coupon to its store and optional category.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>
                Store <span className="text-red-500">*</span>
              </label>
              <StoreDropdown
                value={form.store}
                onChange={(value) => updateField("store", value)}
              />
              {errors.store && (
                <p className="mt-1 text-xs text-red-600">{errors.store}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Category (optional)</label>
              <CategoryDropdown
                value={form.category}
                onChange={(value) => updateField("category", value)}
                contentType="coupon"
              />
              <p className="mt-1 text-xs text-slate-500">
                Only active categories that support coupons should appear here.
              </p>
            </div>

            <div>
              <label htmlFor="coupon-affiliate" className={labelClass}>
                Affiliate URL <span className="text-red-500">*</span>
              </label>
              <input
                id="coupon-affiliate"
                type="url"
                className={inputClass}
                value={form.affiliateUrl}
                onChange={(event) =>
                  updateField("affiliateUrl", event.target.value)
                }
                placeholder="https://example.com/affiliate-link"
                disabled={isBusy}
              />
              {errors.affiliateUrl && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.affiliateUrl}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

       {/* Schedule  ---------------> old --->  <section className={sectionClass}>  */}
      <section>
        <div className="mb-5">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Schedule and publishing
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Configure availability and how the coupon appears on the site.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="coupon-starts" className={labelClass}>
              Starts at (optional)
            </label>
            <input
              id="coupon-starts"
              type="datetime-local"
              className={inputClass}
              value={form.startsAt}
              onChange={(event) =>
                updateField("startsAt", event.target.value)
              }
              disabled={isBusy}
            />
            {errors.startsAt && (
              <p className="mt-1 text-xs text-red-600">
                {errors.startsAt}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="coupon-expires" className={labelClass}>
              Expires at (optional)
            </label>
            <input
              id="coupon-expires"
              type="datetime-local"
              className={inputClass}
              value={form.expiresAt}
              onChange={(event) =>
                updateField("expiresAt", event.target.value)
              }
              disabled={isBusy}
            />
            {errors.expiresAt && (
              <p className="mt-1 text-xs text-red-600">
                {errors.expiresAt}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="coupon-status" className={labelClass}>
              Status
            </label>
            <select
              id="coupon-status"
              className={inputClass}
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as CouponStatus)
              }
              disabled={isBusy}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label htmlFor="coupon-sort-order" className={labelClass}>
              Sort order
            </label>
            <input
              id="coupon-sort-order"
              type="number"
              min="0"
              step="1"
              className={inputClass}
              value={form.sortOrder}
              onChange={(event) =>
                updateField("sortOrder", event.target.value)
              }
              disabled={isBusy}
            />
            {errors.sortOrder && (
              <p className="mt-1 text-xs text-red-600">
                {errors.sortOrder}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] p-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
              className="h-4 w-4 accent-[var(--brand-purple)]"
              disabled={isBusy}
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Active
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] p-3">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                updateField("isFeatured", event.target.checked)
              }
              className="h-4 w-4 accent-[var(--brand-purple)]"
              disabled={isBusy}
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Featured
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] p-3">
            <input
              type="checkbox"
              checked={form.isVerified}
              onChange={(event) =>
                updateField("isVerified", event.target.checked)
              }
              className="h-4 w-4 accent-[var(--brand-purple)]"
              disabled={isBusy}
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              Verified
            </span>
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X size={16} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={isBusy}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              {isUploading
                ? "Uploading image..."
                : isEditing
                  ? "Updating coupon..."
                  : "Creating coupon..."}
            </>
          ) : (
            <>
              <Save size={16} />
              {isEditing ? "Update coupon" : "Create coupon"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
