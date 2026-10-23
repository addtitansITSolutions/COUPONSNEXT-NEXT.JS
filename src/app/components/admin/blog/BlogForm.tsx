"use client";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { Loader2, Save, X } from "lucide-react";

import { toast } from "@/components/ui/toast/toast";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";
import type { Blog, BlogContentNode, BlogStatus } from "@/lib/hooks/useBlogs";

import BlogContentEditor from "./BlogContentEditor";
import BlogImageField from "./BlogImageField";
import CategoryDropdown from "@/components/admin/coupons/CategoryDropdown";
import UserDropdown from "./UserDropdown";

interface BlogFormProps {
  blog?: Blog | null;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
}

type BlogFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: BlogContentNode;
  featuredImage: string;
  featuredImageAlt: string;
  author: string;
  category: string;
  tags: string;
  status: BlogStatus;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
  scheduledAt: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noIndex: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
};

const EMPTY_CONTENT: BlogContentNode = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const inputClass = "w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-purple)] focus:ring-2 focus:ring-[var(--brand-purple)]/15 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass = "mb-1.5 block text-sm font-medium text-[var(--foreground)]";

const sectionClass = "rounded-xl border border-[var(--border)] bg-white p-5 sm:p-6";

const emptyValues: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: EMPTY_CONTENT,
  featuredImage: "",
  featuredImageAlt: "",
  author: "",
  category: "",
  tags: "",
  status: "draft",
  isActive: true,
  isFeatured: false,
  sortOrder: "0",
  scheduledAt: "",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  noIndex: false,
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
};

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

function getInitialValues(blog?: Blog | null): BlogFormValues {
  if (!blog) {
    return {
      ...emptyValues,
      content: {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
    };
  }

  return {
    title: blog.title ?? "",
    slug: blog.slug ?? "",
    excerpt: blog.excerpt ?? "",
    content: blog.content ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    featuredImage: blog.featuredImage ?? "",
    featuredImageAlt: blog.featuredImageAlt ?? "",
    author: blog.author?.id ?? "",
    category: blog.category?.id ?? "",
    tags: (blog.tags ?? []).join(", "),
    status: blog.status ?? "draft",
    isActive: blog.isActive ?? true,
    isFeatured: blog.isFeatured ?? false,
    sortOrder: String(blog.sortOrder ?? 0),
    scheduledAt: toDateTimeLocal(blog.scheduledAt),
    seoTitle: blog.seoTitle ?? "",
    seoDescription: blog.seoDescription ?? "",
    canonicalUrl: blog.canonicalUrl ?? "",
    noIndex: blog.noIndex ?? false,
    ogTitle: blog.ogTitle ?? "",
    ogDescription: blog.ogDescription ?? "",
    ogImage: blog.ogImage ?? "",
  };
}

function getContentText(node: BlogContentNode): string {
  let result = node.text ?? "";

  for (const child of node.content ?? []) {
    result += ` ${getContentText(child)}`;
  }

  return result.trim();
}

export default function BlogForm({ blog, onSubmit, onCancel, submitting = false }: BlogFormProps) {
  const [form, setForm] = useState<BlogFormValues>(() => getInitialValues(blog) );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(blog?.slug));
  const uploadedImageUrlsRef = useRef<Set<string>>(new Set());
  const skipUnmountCleanupRef = useRef(false);
  const isEditing = Boolean(blog?.id);
  const isBusy = submitting || isUploading;
  // Reset the form when switching to a different blog.
  useEffect(() => {
    setForm(getInitialValues(blog));
    setErrors({});
    setImageRemoved(false);
    setSlugTouched(Boolean(blog?.slug));
  }, [blog]);
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
        }
      } catch {
        failedUrls.push(imageUrl);
      }
    }

    return failedUrls;
  }
  function updateField<K extends keyof BlogFormValues>(
    field: K,
    value: BlogFormValues[K]
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
  function clearFieldError(field: string) {
    setErrors((previous) => {
      if (!previous[field]) return previous;

      const next = { ...previous };
      delete next[field];

      return next;
    });
  }
  function handleTitleChange(value: string) {
    updateField("title", value);

    if (!slugTouched) {
      const slug = value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      setForm((previous) => ({
        ...previous,
        title: value,
        slug,
      }));
    }
  }
  function handleImageChange(url: string) {
    // Track only new local uploads, never existing saved images.
    if (url && isLocalUpload(url)) {
      uploadedImageUrlsRef.current.add(url);
    }

    setImageRemoved(!url);
    updateField("featuredImage", url);

    if (!url) {
      updateField("featuredImageAlt", "");
    }
  }
  async function cleanupAfterSuccessfulSave(savedImage: string) {
    const retainedImage = savedImage.trim();

    // Remove all temporary URLs from tracking before cleanup.
    const uploadedUrls = [...uploadedImageUrlsRef.current];
    uploadedImageUrlsRef.current.clear();

    // The successfully saved image must never be deleted.
    const urlsToDelete = uploadedUrls.filter(
      (url) => url !== retainedImage
    );

    const failedUrls = await cleanupImageUrls(urlsToDelete);

    // Keep only failed cleanup attempts for a later cleanup.
    for (const url of failedUrls) {
      uploadedImageUrlsRef.current.add(url);
    }

    if (failedUrls.length) {
      toast.error(
        "Blog saved, but some unused images could not be deleted.",
        { title: "Image cleanup incomplete" }
      );
    }
  }
  async function cleanupTemporaryUploads() {
    const urls = [...uploadedImageUrlsRef.current];
    uploadedImageUrlsRef.current.clear();

    if (urls.length) {
      const failedUrls = await cleanupImageUrls(urls);

      for (const url of failedUrls) {
        uploadedImageUrlsRef.current.add(url);
      }
    }
  }
  // Clean temporary uploads when leaving without saving.
  useEffect(() => {
    return () => {
      if (skipUnmountCleanupRef.current) return;

      const urls = [...uploadedImageUrlsRef.current];
      uploadedImageUrlsRef.current.clear();

      if (urls.length) {
        void cleanupImageUrls(urls);
      }
    };
  }, []);
  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      nextErrors.title = "Blog title is required.";
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
    } else if (form.slug.trim().length > 200) {
      nextErrors.slug = "Slug cannot exceed 200 characters.";
    }

    if (!form.excerpt.trim()) {
      nextErrors.excerpt = "Blog excerpt is required.";
    } else if (form.excerpt.trim().length > 500) {
      nextErrors.excerpt = "Excerpt cannot exceed 500 characters.";
    }

    const contentText = getContentText(form.content);

    if (!contentText) {
      nextErrors.content = "Blog content is required.";
    }

    if (form.featuredImage.length > 500) {
      nextErrors.featuredImage = "Image path cannot exceed 500 characters.";
    }

    if (!form.featuredImage && form.featuredImageAlt.trim()) {
      nextErrors.featuredImageAlt =
        "Upload a featured image or clear its alt text.";
    } else if (form.featuredImageAlt.trim().length > 250) {
      nextErrors.featuredImageAlt =
        "Alt text cannot exceed 250 characters.";
    }

    if (!form.author) {
      nextErrors.author = "Please select an author.";
    } else if (!/^[a-f\d]{24}$/i.test(form.author)) {
      nextErrors.author = "Please select a valid author.";
    }

    if (
      form.category &&
      form.category !== "__none__" &&
      !/^[a-f\d]{24}$/i.test(form.category)
    ) {
      errors.category = "Please select a valid category.";
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (tags.length > 20) {
      nextErrors.tags = "A blog can have at most 20 tags.";
    } else if (tags.some((tag) => tag.length > 50)) {
      nextErrors.tags = "Each tag cannot exceed 50 characters.";
    }

    const sortOrder = Number(form.sortOrder);

    if (
      !form.sortOrder.trim() ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      nextErrors.sortOrder =
        "Sort order must be a non-negative whole number.";
    }

    if (form.status === "scheduled") {
      if (!form.scheduledAt) {
        nextErrors.scheduledAt =
          "A scheduled publication date is required.";
      } else {
        const scheduledDate = new Date(form.scheduledAt);

        if (Number.isNaN(scheduledDate.getTime())) {
          nextErrors.scheduledAt = "Enter a valid scheduled date.";
        } else if (scheduledDate <= new Date()) {
          nextErrors.scheduledAt =
            "Scheduled publication must be in the future.";
        }
      }
    }

    if (form.seoTitle.trim().length > 70) {
      nextErrors.seoTitle = "SEO title cannot exceed 70 characters.";
    }

    if (form.seoDescription.trim().length > 170) {
      nextErrors.seoDescription =
        "SEO description cannot exceed 170 characters.";
    }

    if (form.ogTitle.trim().length > 100) {
      nextErrors.ogTitle = "Open Graph title cannot exceed 100 characters.";
    }

    if (form.ogDescription.trim().length > 200) {
      nextErrors.ogDescription =
        "Open Graph description cannot exceed 200 characters.";
    }

    if (form.ogImage.trim().length > 500) {
      nextErrors.ogImage = "Open Graph image URL cannot exceed 500 characters.";
    }

    if (form.canonicalUrl.trim()) {
      try {
        const url = new URL(form.canonicalUrl.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          nextErrors.canonicalUrl =
            "Canonical URL must use HTTP or HTTPS.";
        }
      } catch {
        nextErrors.canonicalUrl = "Enter a valid canonical URL.";
      }
    }

    if (form.ogImage.trim()) {
      try {
        const url = new URL(form.ogImage.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          nextErrors.ogImage = "Open Graph image must use HTTP or HTTPS.";
        }
      } catch {
        // Local uploaded paths are also supported.
        if (!isLocalUpload(form.ogImage.trim())) {
          nextErrors.ogImage = "Enter a valid Open Graph image URL.";
        }
      }
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
    const tags = [
      ...new Set(
        form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      ),
    ];

    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      author: form.author,
      tags,
      status: form.status,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      sortOrder: Number(form.sortOrder),
      noIndex: form.noIndex,
    };

    // Only send an image when one exists. Explicit removal is handled
    // separately so the update API can clear the existing image.
    if (form.featuredImage.trim()) {
      payload.featuredImage = form.featuredImage.trim();
    } else if (imageRemoved && isEditing) {
      payload.featuredImage = null;
      payload.featuredImageAlt = "";
    }

    if (form.featuredImage.trim()) {
      payload.featuredImageAlt = form.featuredImageAlt.trim();
    }

    if (form.category === "__none__") {
      payload.category = null;
    } else if (form.category) {
      payload.category = form.category;
    }

    if (form.status === "scheduled" && form.scheduledAt) {
      payload.scheduledAt = new Date(form.scheduledAt).toISOString();
    }

    if (form.seoTitle.trim()) {
      payload.seoTitle = form.seoTitle.trim();
    }

    if (form.seoDescription.trim()) {
      payload.seoDescription = form.seoDescription.trim();
    }

    if (form.canonicalUrl.trim()) {
      payload.canonicalUrl = form.canonicalUrl.trim();
    }

    if (form.ogTitle.trim()) {
      payload.ogTitle = form.ogTitle.trim();
    }

    if (form.ogDescription.trim()) {
      payload.ogDescription = form.ogDescription.trim();
    }

    if (form.ogImage.trim()) {
      payload.ogImage = form.ogImage.trim();
    }

    try {
      // Avoid unmount cleanup while the API saves the blog.
      skipUnmountCleanupRef.current = true;
      await onSubmit(payload);
      await cleanupAfterSuccessfulSave(form.featuredImage.trim());
    } catch (error: any) {
      skipUnmountCleanupRef.current = false;
      const message = error instanceof Error ? error.message : getApiErrorMessageOnUi( error, isEditing ? "Unable to update blog." : "Unable to create blog." );
      toast.error(message);
    }
  }
  function handleCancel() {
    if (isBusy) return;
    void cleanupTemporaryUploads();
    onCancel();
  }
  function handleTextChange(
    field:
      | "seoTitle"
      | "seoDescription"
      | "canonicalUrl"
      | "ogTitle"
      | "ogDescription"
      | "ogImage"
      | "featuredImageAlt"
      | "tags",
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    updateField(field, event.target.value);
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            {isEditing ? "Edit Blog" : "Create Blog"}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          disabled={isBusy}
          aria-label="Close form"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
        >
          <X size={19} />
        </button>
      </div>

      {/* Basic information */}
      <section>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Basic information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Add the title and summary readers will see.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="blog-title" className={labelClass}>
              Blog title <span className="text-red-500">*</span>
            </label>
            <input
              id="blog-title"
              className={inputClass}
              value={form.title}
              onChange={(event) => handleTitleChange(event.target.value)}
              maxLength={200}
              placeholder="e.g. The Ultimate Guide to Finding Online Deals"
              disabled={isBusy}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="blog-slug" className={labelClass}>
              URL slug <span className="text-red-500">*</span>
            </label>
            <input
              id="blog-slug"
              className={inputClass}
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateField("slug", event.target.value);
              }}
              maxLength={200}
              placeholder="ultimate-guide-online-deals"
              disabled={isBusy}
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-600">{errors.slug}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

         
        </div>

         <div className="mt-5 ">
            <label htmlFor="blog-excerpt" className={labelClass}>
              Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="blog-excerpt"
              className={inputClass}
              value={form.excerpt}
              onChange={(event) => updateField("excerpt", event.target.value)}
              maxLength={500}
              rows={3}
              placeholder="A short summary for blog cards and search results."
              disabled={isBusy}
            />
            <div className="mt-1 flex justify-between gap-3">
              {errors.excerpt ? (
                <p className="text-xs text-red-600">{errors.excerpt}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400">
                {form.excerpt.length}/500
              </span>
            </div>
          </div>
      </section>

      {/* Article content */}
      <section >
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Article content <span className="text-red-500">*</span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Write your article and format it using the editor toolbar.
          </p>
        </div>

        <BlogContentEditor
          value={form.content}
          onChange={(content) => updateField("content", content)}
          error={errors.content}
          disabled={isBusy}
          onClearError={() => clearFieldError("content")}
        />
      </section>

      {/* Featured image and classification */}
      <section className={sectionClass}>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Featured image
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Optional image used for blog cards and article previews.
          </p>
        </div>

        <BlogImageField
          value={form.featuredImage}
          error={errors.featuredImage}
          disabled={submitting}
          onChange={handleImageChange}
          onUploadingChange={setIsUploading}
          onClearError={() => clearFieldError("featuredImage")}
        />

        <div className="mt-5">
          <label htmlFor="blog-image-alt" className={labelClass}>
            Featured image alt text
          </label>
          <input
            id="blog-image-alt"
            className={inputClass}
            value={form.featuredImageAlt}
            onChange={(event) =>
              handleTextChange("featuredImageAlt", event)
            }
            maxLength={250}
            placeholder="Describe the image for accessibility"
            disabled={isBusy || !form.featuredImage}
          />
          {errors.featuredImageAlt && (
            <p className="mt-1 text-xs text-red-600">
              {errors.featuredImageAlt}
            </p>
          )}
        </div>
      </section>

      {/* Author, category, tags */}
      <section className={sectionClass}>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Author and classification
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Select the author and organize the article.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Author <span className="text-red-500">*</span>
            </label>
            <UserDropdown
              value={form.author}
              onChange={(value) => updateField("author", value)}
              role="admin"
            />
            {errors.author && (
              <p className="mt-1 text-xs text-red-600">{errors.author}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Only active admin accounts should be selectable as authors.
            </p>
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <CategoryDropdown
              value={form.category}
              onChange={(value) => updateField("category", value)}
              contentType="blog"
            />
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Category is optional.
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="blog-tags" className={labelClass}>
              Tags
            </label>
            <input
              id="blog-tags"
              className={inputClass}
              value={form.tags}
              onChange={(event) => handleTextChange("tags", event)}
              placeholder="coupons, shopping tips, savings"
              disabled={isBusy}
            />
            {errors.tags && (
              <p className="mt-1 text-xs text-red-600">{errors.tags}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Separate tags with commas. Maximum 20 tags, 50 characters each.
            </p>
          </div>
        </div>
      </section>

      {/* Publishing settings */}
      <section className={sectionClass}>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Publishing settings
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose when the article should be published and how it appears.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="blog-status" className={labelClass}>
              Status
            </label>
            <select
              id="blog-status"
              className={inputClass}
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as BlogStatus)
              }
              disabled={isBusy}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              {/* <option value="scheduled">Scheduled</option> */}
            </select>
          </div>

          {form.status === "scheduled" && (
            <div>
              <label htmlFor="blog-scheduled-at" className={labelClass}>
                Scheduled publication <span className="text-red-500">*</span>
              </label>
              <input
                id="blog-scheduled-at"
                type="datetime-local"
                className={inputClass}
                value={form.scheduledAt}
                onChange={(event) =>
                  updateField("scheduledAt", event.target.value)
                }
                disabled={isBusy}
              />
              {errors.scheduledAt && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.scheduledAt}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                A background publishing job is required to publish scheduled
                articles automatically.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="blog-sort-order" className={labelClass}>
              Sort order
            </label>
            <input
              id="blog-sort-order"
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
              <p className="mt-1 text-xs text-red-600">{errors.sortOrder}</p>
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
              checked={form.noIndex}
              onChange={(event) =>
                updateField("noIndex", event.target.checked)
              }
              className="h-4 w-4 accent-[var(--brand-purple)]"
              disabled={isBusy}
            />
            <span className="text-sm font-medium text-[var(--foreground)]">
              No index
            </span>
          </label>
        </div>
      </section>

      {/* SEO */}
      <section className={sectionClass}>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            SEO settings
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Optional search engine and social sharing metadata.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div>
            <label htmlFor="blog-seo-title" className={labelClass}>
              SEO title
            </label>
            <input
              id="blog-seo-title"
              className={inputClass}
              value={form.seoTitle}
              onChange={(event) => handleTextChange("seoTitle", event)}
              maxLength={70}
              placeholder="Leave empty to use the blog title"
              disabled={isBusy}
            />
            <div className="mt-1 flex justify-between gap-3">
              {errors.seoTitle && (
                <p className="text-xs text-red-600">{errors.seoTitle}</p>
              )}
              <span className="ml-auto text-xs text-slate-400">
                {form.seoTitle.length}/70
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="blog-seo-description" className={labelClass}>
              SEO description
            </label>
            <textarea
              id="blog-seo-description"
              className={inputClass}
              value={form.seoDescription}
              onChange={(event) => handleTextChange("seoDescription", event)}
              maxLength={170}
              rows={3}
              placeholder="Leave empty to use the blog excerpt"
              disabled={isBusy}
            />
            <div className="mt-1 flex justify-between gap-3">
              {errors.seoDescription && (
                <p className="text-xs text-red-600">
                  {errors.seoDescription}
                </p>
              )}
              <span className="ml-auto text-xs text-slate-400">
                {form.seoDescription.length}/170
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="blog-canonical-url" className={labelClass}>
              Canonical URL
            </label>
            <input
              id="blog-canonical-url"
              type="url"
              className={inputClass}
              value={form.canonicalUrl}
              onChange={(event) => handleTextChange("canonicalUrl", event)}
              placeholder="https://couponsnext.com/blog/example"
              disabled={isBusy}
            />
            {errors.canonicalUrl && (
              <p className="mt-1 text-xs text-red-600">
                {errors.canonicalUrl}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Open Graph */}
      <section className={sectionClass}>
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Social sharing
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Customize how the article appears when shared on social platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div>
            <label htmlFor="blog-og-title" className={labelClass}>
              Open Graph title
            </label>
            <input
              id="blog-og-title"
              className={inputClass}
              value={form.ogTitle}
              onChange={(event) => handleTextChange("ogTitle", event)}
              maxLength={100}
              placeholder="Optional social sharing title"
              disabled={isBusy}
            />
            {errors.ogTitle && (
              <p className="mt-1 text-xs text-red-600">{errors.ogTitle}</p>
            )}
          </div>

          <div>
            <label htmlFor="blog-og-description" className={labelClass}>
              Open Graph description
            </label>
            <textarea
              id="blog-og-description"
              className={inputClass}
              value={form.ogDescription}
              onChange={(event) => handleTextChange("ogDescription", event)}
              maxLength={200}
              rows={3}
              placeholder="Optional social sharing description"
              disabled={isBusy}
            />
            {errors.ogDescription && (
              <p className="mt-1 text-xs text-red-600">
                {errors.ogDescription}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="blog-og-image" className={labelClass}>
              Open Graph image URL
            </label>
            <input
              id="blog-og-image"
              className={inputClass}
              value={form.ogImage}
              onChange={(event) => handleTextChange("ogImage", event)}
              maxLength={500}
              placeholder="https://example.com/social-image.jpg"
              disabled={isBusy}
            />
            {errors.ogImage && (
              <p className="mt-1 text-xs text-red-600">{errors.ogImage}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              If omitted, your site can use the featured image as a fallback.
            </p>
          </div>
        </div>
      </section>

      {/* Form actions */}
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
                  ? "Updating blog..."
                  : "Creating blog..."}
            </>
          ) : (
            <>
              <Save size={16} />
              {isEditing ? "Update blog" : "Create blog"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}