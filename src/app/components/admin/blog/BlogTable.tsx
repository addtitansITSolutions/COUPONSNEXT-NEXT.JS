
"use client";

import {
  Pencil,
  Star,
  Trash2,
  ExternalLink,
  FileText,
} from "lucide-react";

import type { Blog } from "@/lib/hooks/useBlogs";

interface BlogTableProps {
  blogs: Blog[];
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
  onToggleActive: (blog: Blog) => void;
  onToggleFeatured: (blog: Blog) => void;
  actionLoadingId?: string | null;
}

function formatDate(date?: string | Date | null) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getAuthorName(author: Blog["author"]) {
  if (!author) return "No author";
  return typeof author === "string" ? author : author.name || "No author";
}

function getCategoryName(category: Blog["category"]) {
  if (!category) return "No category";
  return typeof category === "string"
    ? category
    : category.name || "No category";
}

function getExcerpt(blog: Blog) {
  if (blog.excerpt?.trim()) return blog.excerpt;
  return "No excerpt";
}

export default function BlogTable({
  blogs,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleFeatured,
  actionLoadingId,
}: BlogTableProps) {
  return (
    <div className="overflow-hidden rounded-xl rounded-b-[0px] border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1300px] w-full text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {[
                "Blog",
                "Slug",
                "Category",
                "Author",
                "Status",
                "Active",
                "Featured",
                "Sort Order",
                "Views",
                "Published",
                "Created",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {blogs.map((blog) => {
              const isActionLoading = actionLoadingId === blog.id;
              const authorName = getAuthorName(blog.author);
              const categoryName = getCategoryName(blog.category);

              return (
                <tr
                  key={blog.id}
                  className="transition hover:bg-gray-50/70"
                >
                  {/* Blog */}
                  <td className="px-4 py-4">
                    <div className="flex min-w-[260px] items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                        {blog.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={blog.featuredImage}
                            alt={blog.featuredImageAlt || `${blog.title} image`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <FileText
                            size={20}
                            className="text-gray-400"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          title={blog.title}
                          className="max-w-[260px] truncate text-sm font-semibold text-gray-900"
                        >
                          {blog.title}
                        </p>

                        <p
                          title={getExcerpt(blog)}
                          className="mt-0.5 max-w-[260px] truncate text-xs text-gray-500"
                        >
                          {getExcerpt(blog)}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-4 py-4">
                    <span
                      title={blog.slug}
                      className="whitespace-nowrap font-mono text-xs text-gray-600"
                    >
                      {blog.slug}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-4">
                    {blog.category ? (
                      <span className="inline-flex max-w-[150px] truncate whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {categoryName}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Author */}
                  <td className="px-4 py-4">
                    <span
                      title={authorName}
                      className="block max-w-[160px] truncate text-sm text-gray-700"
                    >
                      {authorName}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                        blog.status === "published"
                          ? "bg-green-50 text-green-700"
                          : blog.status === "scheduled"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {blog.status.charAt(0).toUpperCase() +
                        blog.status.slice(1)}
                    </span>
                  </td>

                  {/* Active */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleActive(blog)}
                      disabled={isActionLoading}
                      title={
                        blog.isActive
                          ? "Click to deactivate"
                          : "Click to activate"
                      }
                      aria-label={`${blog.isActive ? "Deactivate" : "Activate"} ${blog.title}`}
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          blog.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {blog.isActive ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>

                  {/* Featured */}
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => onToggleFeatured(blog)}
                      disabled={isActionLoading}
                      title={
                        blog.isFeatured
                          ? "Remove from featured"
                          : "Mark as featured"
                      }
                      aria-label={`${blog.isFeatured ? "Remove from featured" : "Feature"} ${blog.title}`}
                      className="disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
                          blog.isFeatured
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Star
                          size={13}
                          className={blog.isFeatured ? "fill-current" : ""}
                        />
                        {blog.isFeatured ? "Featured" : "Not featured"}
                      </span>
                    </button>
                  </td>

                  {/* Sort Order */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {blog.sortOrder ?? 0}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-700">
                      {(blog.viewCount ?? 0).toLocaleString("en-US")}
                    </span>
                  </td>

                  {/* Published */}
                  <td className="px-4 py-4">
                    <span className="whitespace-nowrap text-sm text-gray-600">
                      {formatDate(blog.publishedAt)}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-4 py-4">
                    <span className="whitespace-nowrap text-sm text-gray-600">
                      {formatDate(blog.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(blog)}
                        disabled={isActionLoading}
                        title="Edit blog"
                        aria-label={`Edit ${blog.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Pencil size={16} />
                      </button>

                      <a
                        href={`/blogs/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Preview blog"
                        aria-label={`Preview ${blog.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-purple-50 hover:text-[var(--brand-purple)]"
                      >
                        <ExternalLink size={16} />
                      </a>

                      <button
                        type="button"
                        onClick={() => onDelete(blog)}
                        disabled={isActionLoading}
                        title="Delete blog"
                        aria-label={`Delete ${blog.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
