"use client";
import { useMemo, useRef, useState } from "react";
import {
  FileText,
  Plus,
  RefreshCw,
  Loader2
} from "lucide-react";

import BlogDeleteModal from "@/components/admin/blog/BlogDeleteModal";
import BlogForm from "@/components/admin/blog/BlogForm";
import BlogPagination from "@/components/admin/blog/BlogPagination";
import BlogTable from "@/components/admin/blog/BlogTable";
import BlogTableSkeleton from "@/components/admin/blog/BlogTableSkeleton";

import BlogEmptyState from "./components/BlogEmptyState";
import BlogErrorState from "./components/BlogErrorState";
import BlogFilters from "./components/BlogFilters";

import { useBlogs, type Blog } from "@/lib/hooks/useBlogs";
import { toast } from "@/components/ui/toast/toast";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";

export default function BlogsPage() {
  const {
    blogs,
    pagination,
    filters,
    loading,
    error,
    setSearch,
    setCategory,
    setAuthor,
    setStatus,
    setIsActive,
    setIsFeatured,
    setPage,
    setLimit,
    refresh,
    getBlog,
    deleteBlog,
    updateBlog,
    clearFilters,
  } = useBlogs({
    initialLimit: 10,
  });

  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(false);
  const isEditingForm = fetchingBlog || Boolean(editingBlog);
  const actionInProgressRef = useRef<Set<string>>(new Set());

  // Determine whether any filters are active.
  const hasFilters = useMemo(() => {
    return (
      filters.search.trim() !== "" ||
      filters.category !== "" ||
      filters.author !== "" ||
      filters.status !== "" ||
      filters.isActive !== "" ||
      filters.isFeatured !== ""
    );
  }, [filters]);

  // Open create form.
  const handleCreate = () => {
    setEditingBlog(null);
    setShowForm(true);
  };

  // Fetch the complete blog only when opening Edit.
  const handleEdit = async (blog: Blog) => {
    try {
      setFetchingBlog(true);
      setEditingBlog(null);
      setShowForm(true);

      const fullBlog = await getBlog(blog.id);

      setEditingBlog(fullBlog);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load blog details.";

      toast.error(message, {
        title: "Unable to Load Blog",
      });

      setShowForm(false);
      setEditingBlog(null);
    } finally {
      setFetchingBlog(false);
    }
  };

  // Close create/edit form.
  const handleCloseForm = () => {
    if (formSubmitting || fetchingBlog) {
      return;
    }

    setShowForm(false);
    setEditingBlog(null);
  };

  // Create or update a blog.
  const handleSubmitForm = async ( formData: Record<string, unknown> ) => {
    const isEditing = Boolean(editingBlog);

    try {
      setFormSubmitting(true);

      if (editingBlog) {
        await updateBlog(editingBlog.id, formData);

        toast.success("Blog updated successfully.", {
          title: "Blog Updated",
        });

        setShowForm(false);
        setEditingBlog(null);

        return;
      }

      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = getApiErrorMessageOnUi(
          data,
          "Unable to create blog."
        );

        throw new Error(message);
      }

      // Refresh so the newly created blog appears in the list.
      await refresh();

      toast.success("Blog created successfully.", {
        title: "Blog Created",
      });

      setShowForm(false);
      setEditingBlog(null);
    } catch (error) {
      if (isEditing && error instanceof Error) {
        // toast.error(error.message, {
        //   title: "Update Blog Failed",
        // });
      }

      throw error;
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open delete confirmation.
  const handleDelete = (blog: Blog) => {
    setDeletingBlog(blog);
  };

  // Confirm deletion.
  const handleConfirmDelete = async () => {
    if (!deletingBlog) {
      return;
    }

    try {
      setActionLoadingId(deletingBlog.id);

      await deleteBlog(deletingBlog.id);

      toast.success("Blog deleted successfully.", {
        title: "Blog Deleted",
      });

      setDeletingBlog(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to delete blog.";

      toast.error(message, {
        title: "Delete Blog Failed",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle active status.
  const handleToggleActive = async (blog: Blog) => {
    if (actionInProgressRef.current.has(blog.id)) {
      return;
    }

    actionInProgressRef.current.add(blog.id);

    try {
      setActionLoadingId(blog.id);

      await updateBlog(blog.id, {
        isActive: !blog.isActive,
      });

      toast.success(
        `${blog.title} is now ${blog.isActive ? "inactive" : "active"}.`,
        {
          title: blog.isActive
            ? "Blog Deactivated"
            : "Blog Activated",
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update blog.";

      toast.error(message, {
        title: "Update Blog Failed",
      });
    } finally {
      actionInProgressRef.current.delete(blog.id);
      setActionLoadingId(null);
    }
  };

  // Toggle featured status.
  const handleToggleFeatured = async (blog: Blog) => {
    if (actionInProgressRef.current.has(blog.id)) {
      return;
    }

    actionInProgressRef.current.add(blog.id);

    try {
      setActionLoadingId(blog.id);

      await updateBlog(blog.id, {
        isFeatured: !blog.isFeatured,
      });

      toast.success(
        `${blog.title} has been ${
          blog.isFeatured ? "removed from" : "added to"
        } featured blogs.`,
        {
          title: blog.isFeatured
            ? "Removed From Featured"
            : "Blog Featured",
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to update blog.";

      toast.error(message, {
        title: "Update Blog Failed",
      });
    } finally {
      actionInProgressRef.current.delete(blog.id);
      setActionLoadingId(null);
    }
  };

  // Retry loading blogs.
  const handleRetry = async () => {
    try {
      await refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load blogs.";

      toast.error(message, {
        title: "Unable to Load Blogs",
      });
    }
  };

  // CREATE / EDIT FORM
  if (showForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseForm}
                disabled={formSubmitting || fetchingBlog}
                className="text-sm font-medium text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Blogs
              </button>

              <span className="text-gray-300">/</span>

              <span className="text-sm font-medium text-gray-900">
                {isEditingForm ? "Edit Blog" : "Create Blog"}
              </span>
            </div>

            {/* <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
              {editingBlog ? "Edit Blog" : "Create Blog"}
            </h1> */}

            <p className="mt-1 text-sm text-gray-500">
              {editingBlog
                ? "Update the blog content, publishing settings and SEO information."
                : "Create a new blog post for CouponsNext."}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          {fetchingBlog ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
              <Loader2
                size={32}
                className="animate-spin text-[var(--brand-purple)]"
              />

              <p className="mt-4 text-sm font-medium text-gray-700">
                Loading blog details...
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Please wait while we prepare the editor.
              </p>
            </div>
          ) : (
            <BlogForm
              key={editingBlog?.id ?? "new-blog"}
              blog={editingBlog}
              onSubmit={handleSubmitForm}
              onCancel={handleCloseForm}
              submitting={formSubmitting}
            />
          )}
        </div>
      </div>
    );
  }

  // BLOG LIST
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText
                size={21}
                className="text-[var(--brand-purple)]"
              />

              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Blogs
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Manage blog posts, content, publishing status and SEO.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button
              type="button"
              onClick={handleRetry}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            {/* Add Blog */}
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--accent-hover)]"
            >
              <Plus size={17} />
              Add Blog
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <BlogFilters
            filters={filters}
            onSearchChange={setSearch}
            onCategoryChange={setCategory}
            onAuthorChange={setAuthor}
            onStatusChange={setStatus}
            onIsActiveChange={setIsActive}
            onIsFeaturedChange={setIsFeatured}
            onClear={clearFilters}
          />
        </div>

        {/* Error / Loading / Empty / Table */}
        {error && !loading ? (
          <BlogErrorState
            message={error}
            onRetry={handleRetry}
          />
        ) : loading && blogs.length === 0 ? (
          /* Initial loading */
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <BlogTableSkeleton />
          </div>
        ) : blogs.length === 0 ? (
          /* Empty state */
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <BlogEmptyState
              hasFilters={hasFilters}
              onClearFilters={
                hasFilters ? clearFilters : undefined
              }
            />
          </div>
        ) : (
          /* Table */
          <div className="relative rounded-xl rounded-b-none border border-gray-200 bg-white shadow-sm">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-white/50 pt-6 backdrop-blur-[1px]">
                <div className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm">
                  <RefreshCw
                    size={14}
                    className="animate-spin"
                  />
                  Updating...
                </div>
              </div>
            )}

            <BlogTable
              blogs={blogs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
              onToggleFeatured={handleToggleFeatured}
              actionLoadingId={actionLoadingId}
            />

            {/* Pagination */}
            <div className="rounded-b-none border-b border-gray-200 bg-white p-4 shadow-sm">
              <BlogPagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                limit={pagination.limit}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={setPage}
                onLimitChange={setLimit}
                disabled={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <BlogDeleteModal
        blog={deletingBlog}
        open={!!deletingBlog}
        loading={deletingBlog?.id === actionLoadingId}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (actionLoadingId === null) {
            setDeletingBlog(null);
          }
        }}
      />
    </>
  );
}
