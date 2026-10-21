"use client";

import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Image as ImageIcon, Loader2, Save, X } from "lucide-react";

import { toast } from "@/components/ui/toast/toast";
import StoreDropdown from "@/components/admin/coupons/StoreDropdown";
import BannerImageField from "@/components/admin/banners/BannerImageField";
import type { Banner } from "@/lib/hooks/useBanners";

type BannerFormValues = {
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
  store: string;
  affiliateUrl: string;
  country: string;
  isActive: boolean;
  sortOrder: string;
};

interface BannerFormProps {
  banner?: Banner | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

const inputClass =
  "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/15 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass =
  "mb-1.5 block text-sm font-medium text-[var(--foreground)]";

const sectionClass =
  "rounded-xl border border-[var(--border)] bg-white p-5 sm:p-6";

function getInitialValues(banner?: Banner | null): BannerFormValues {
  return {
    title: banner?.title ?? "",
    subtitle: banner?.subtitle ?? "",
    desktopImage: banner?.desktopImage ?? "",
    mobileImage: banner?.mobileImage ?? "",
    store: banner?.store?.id ?? "",
    affiliateUrl: banner?.affiliateUrl ?? "",
    country: banner?.country ?? "US",
    isActive: banner?.isActive ?? true,
    sortOrder: String(banner?.sortOrder ?? 0),
  };
}

function isLocalUpload(url: string): boolean {
  return url.startsWith("/uploads/") && !url.startsWith("//");
}

export default function BannerForm({
  banner,
  onSubmit,
  onCancel,
  submitting = false,
}: BannerFormProps) {
  const [form, setForm] = useState<BannerFormValues>(() =>
    getInitialValues(banner)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDesktopUploading, setIsDesktopUploading] = useState(false);
  const [isMobileUploading, setIsMobileUploading] = useState(false);

  // Only track image URLs uploaded during this form session.
  const uploadedImageUrlsRef = useRef<Set<string>>(new Set());

  // Prevent unmount cleanup from deleting images during a successful save.
  const saveInProgressRef = useRef(false);

  const bannerId = banner?.id ?? "";
  const bannerIdRef = useRef(bannerId);
  const isEditing = Boolean(bannerId);

  const isUploading = isDesktopUploading || isMobileUploading;
  const isBusy = submitting || isUploading;

  async function cleanupImageUrls(urls: string[]): Promise<string[]> {
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
          continue;
        }

        const result = await response.json().catch(() => null);

        if (result && result.success === false) {
          failedUrls.push(imageUrl);
        }
      } catch {
        failedUrls.push(imageUrl);
      }
    }

    return failedUrls;
  }

  useEffect(() => {
    if (bannerIdRef.current !== bannerId) {
      const previousUploads = [...uploadedImageUrlsRef.current];
      uploadedImageUrlsRef.current.clear();

      if (previousUploads.length) {
        void cleanupImageUrls(previousUploads);
      }
    }

    bannerIdRef.current = bannerId;
    setForm(getInitialValues(banner));
    setErrors({});
    setIsDesktopUploading(false);
    setIsMobileUploading(false);
  }, [banner, bannerId]);

  // Remove temporary uploads when leaving the form, except while saving.
  useEffect(() => {
    return () => {
      if (saveInProgressRef.current) return;

      const urls = [...uploadedImageUrlsRef.current];

      if (urls.length) {
        void cleanupImageUrls(urls);
      }
    };
  }, []);

  function updateField<K extends keyof BannerFormValues>(
    field: K,
    value: BannerFormValues[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];
      return next;
    });
  }

  function handleImageChange(
    field: "desktopImage" | "mobileImage",
    url: string
  ) {
    if (url && isLocalUpload(url)) {
      uploadedImageUrlsRef.current.add(url);
    }

    updateField(field, url);
  }

  async function cleanupAfterSuccessfulSave(savedImages: string[]) {
    const retainedUrls = new Set(savedImages.filter(Boolean));

    // Never leave saved uploads in the set that unmount cleanup deletes.
    const urlsToDelete = [...uploadedImageUrlsRef.current].filter(
      (url) => !retainedUrls.has(url)
    );

    uploadedImageUrlsRef.current = new Set(urlsToDelete);

    const failedUrls = await cleanupImageUrls(urlsToDelete);

    // Retain only failed cleanup attempts for a possible retry.
    uploadedImageUrlsRef.current = new Set(failedUrls);

    if (failedUrls.length) {
      toast.error(
        "Banner saved, but some unused images could not be deleted.",
        { title: "Image cleanup incomplete" }
      );
    }
  }

  async function cleanupTemporaryUploads() {
    const urls = [...uploadedImageUrlsRef.current];
    uploadedImageUrlsRef.current.clear();

    if (!urls.length) return;

    const failedUrls = await cleanupImageUrls(urls);

    for (const url of failedUrls) {
      uploadedImageUrlsRef.current.add(url);
    }
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Banner title is required.";
    } else if (form.title.trim().length > 150) {
      nextErrors.title = "Title cannot exceed 150 characters.";
    }

    if (form.subtitle.trim().length > 300) {
      nextErrors.subtitle = "Subtitle cannot exceed 300 characters.";
    }

    if (!form.desktopImage.trim()) {
      nextErrors.desktopImage = "Please upload a desktop banner image.";
    }

    if (!form.mobileImage.trim()) {
      nextErrors.mobileImage = "Please upload a mobile banner image.";
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
      form.sortOrder.trim() === "" ||
      !Number.isSafeInteger(Number(form.sortOrder)) ||
      Number(form.sortOrder) < 0
    ) {
      nextErrors.sortOrder =
        "Sort order must be a non-negative whole number.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please correct the highlighted fields.");
      return false;
    }

    return true;
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy || !validate()) return;

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      desktopImage: form.desktopImage.trim(),
      mobileImage: form.mobileImage.trim(),
      store: form.store,
      affiliateUrl: form.affiliateUrl.trim(),
      country: form.country.trim().toUpperCase(),
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder),
    };

    saveInProgressRef.current = true;

    try {
      await onSubmit(payload);

      // Run only after the parent confirms that the save succeeded.
      await cleanupAfterSuccessfulSave([
        form.desktopImage.trim(),
        form.mobileImage.trim(),
      ]);
    } catch {
      // The parent page is responsible for displaying the API error.
    } finally {
      saveInProgressRef.current = false;
    }
  }

  async function handleCancel() {
    if (isBusy) return;

    await cleanupTemporaryUploads();
    onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? "Edit Banner" : "Create Banner"}
          </h2>
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

      <section className={sectionClass}>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Basic information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Add the text associated with this banner.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="banner-title" className={labelClass}>
              Banner title <span className="text-red-500">*</span>
            </label>
            <input
              id="banner-title"
              className={inputClass}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              maxLength={150}
              placeholder="e.g. Exclusive deals this week"
              disabled={isBusy}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="banner-subtitle" className={labelClass}>
              Subtitle <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="banner-subtitle"
              className={inputClass}
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
              maxLength={300}
              rows={3}
              placeholder="Add a short supporting message."
              disabled={isBusy}
            />
            {errors.subtitle && (
              <p className="mt-1 text-xs text-red-600">{errors.subtitle}</p>
            )}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-[var(--brand-purple)]" />
            <h3 className="text-sm font-semibold text-gray-900">
              Banner images
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Upload separate images for desktop and mobile layouts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BannerImageField
            label="Desktop banner image"
            value={form.desktopImage}
            error={errors.desktopImage}
            disabled={isBusy}
            onChange={(url) => handleImageChange("desktopImage", url)}
            onUploadingChange={setIsDesktopUploading}
            onClearError={() =>
              setErrors((previous) => {
                const next = { ...previous };
                delete next.desktopImage;
                return next;
              })
            }
          />

          <BannerImageField
            label="Mobile banner image"
            value={form.mobileImage}
            error={errors.mobileImage}
            disabled={isBusy}
            onChange={(url) => handleImageChange("mobileImage", url)}
            onUploadingChange={setIsMobileUploading}
            onClearError={() =>
              setErrors((previous) => {
                const next = { ...previous };
                delete next.mobileImage;
                return next;
              })
            }
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Both images are required. Use a wide image for desktop and a
          portrait-friendly image for mobile.
        </p>
      </section>

      <section className={sectionClass}>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Store and tracking
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select the store and configure the destination for banner clicks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
            <label htmlFor="banner-country" className={labelClass}>
              Country code <span className="text-red-500">*</span>
            </label>
            <input
              id="banner-country"
              className={inputClass}
              value={form.country}
              onChange={(event) =>
                updateField(
                  "country",
                  event.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2)
                )
              }
              maxLength={2}
              placeholder="US"
              disabled={isBusy}
            />
            {errors.country && (
              <p className="mt-1 text-xs text-red-600">{errors.country}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Examples: US, GB, IN.
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="banner-affiliate" className={labelClass}>
              Affiliate URL <span className="text-red-500">*</span>
            </label>
            <input
              id="banner-affiliate"
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
            <p className="mt-1 text-xs text-slate-500">
              This URL is used when visitors click the banner.
            </p>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-900">
            Publishing settings
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Control visibility and display order.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <label htmlFor="banner-sort-order" className={labelClass}>
              Sort order
            </label>
            <input
              id="banner-sort-order"
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
            <p className="mt-1 text-xs text-slate-500">
              Lower values appear first when sorted by order.
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--border)] p-4">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
              className="h-4 w-4 accent-[var(--brand-purple)]"
              disabled={isBusy}
            />
            <span>
              <span className="block text-sm font-medium text-[var(--foreground)]">
                Active banner
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Only active banners are eligible to display.
              </span>
            </span>
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => void handleCancel()}
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
                ? "Uploading images..."
                : isEditing
                  ? "Updating banner..."
                  : "Creating banner..."}
            </>
          ) : (
            <>
              <Save size={16} />
              {isEditing ? "Update banner" : "Create banner"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}