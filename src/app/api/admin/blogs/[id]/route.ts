import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import { updateBlogSchema } from "@/lib/validations/blog";
import { deleteUploadedImage } from "@/lib/uploads";

import Blog from "@/models/Blog";
import Category from "@/models/Category";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

function validateBlogId(id: string) {
  if (!objectIdRegex.test(id)) {
    throw new ApiError(
      400,
      "Blog ID must be a valid MongoDB ObjectId",
      "INVALID_BLOG_ID"
    );
  }
}

function blogResponse(blog: any) {
  const author = blog.author;
  const category = blog.category;

  return {
    id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt,
    content: blog.content,
    featuredImage: blog.featuredImage || "",
    featuredImageAlt: blog.featuredImageAlt || "",
    author: author
      ? {
          id: author._id.toString(),
          name: author.name,
          email: author.email,
        }
      : null,
    category: category
      ? {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
        }
      : null,
    tags: blog.tags || [],
    status: blog.status,
    isActive: blog.isActive,
    isFeatured: blog.isFeatured,
    sortOrder: blog.sortOrder,
    viewCount: blog.viewCount ?? 0,
    publishedAt: blog.publishedAt,
    scheduledAt: blog.scheduledAt,
    seoTitle: blog.seoTitle || "",
    seoDescription: blog.seoDescription || "",
    canonicalUrl: blog.canonicalUrl || "",
    noIndex: blog.noIndex ?? false,
    ogTitle: blog.ogTitle || "",
    ogDescription: blog.ogDescription || "",
    ogImage: blog.ogImage || "",
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
}

async function populateBlog(id: string) {
  return Blog.findById(id)
    .populate("author", "name email")
    .populate("category", "name slug");
}

// GET /api/admin/blogs/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    validateBlogId(id);

    await connectDB();

    const blog = await populateBlog(id);

    if (!blog) {
      throw new ApiError(404, "Blog not found", "BLOG_NOT_FOUND");
    }

    return NextResponse.json(
      {
        success: true,
        blog: blogResponse(blog),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}

// PATCH /api/admin/blogs/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    validateBlogId(id);
    const body = await request.json();
    const validation = updateBlogSchema.safeParse(body);
    if (!validation.success) {
      throw validation.error;
    }
    const blogData = validation.data;
    await connectDB();
    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      throw new ApiError(404, "Blog not found", "BLOG_NOT_FOUND");
    }
    // Check slug uniqueness against other blogs.
    if (blogData.slug && blogData.slug !== existingBlog.slug) {
      const duplicateSlug = await Blog.exists({
        slug: blogData.slug,
        _id: { $ne: existingBlog._id },
      });
      if (duplicateSlug) {
        throw new ApiError(
          409,
          "A blog with this slug already exists",
          "BLOG_SLUG_EXISTS"
        );
      }
    }

    // Determine the final values after applying this update.
    const finalStatus = blogData.status ?? existingBlog.status;
    const finalIsActive = blogData.isActive ?? existingBlog.isActive;
    const finalAuthorId = blogData.author ?? existingBlog.author.toString();
    const finalCategoryId = blogData.category !== undefined ? blogData.category : existingBlog.category?.toString();
    const finalScheduledAt = blogData.scheduledAt !== undefined ? blogData.scheduledAt : existingBlog.scheduledAt;

    // Validate the author.
    const author = await User.findById(finalAuthorId).select( "name email role isActive" );

    if (!author || !author.isActive) {
      throw new ApiError(
        400,
        "The selected author does not exist or is inactive",
        "AUTHOR_INVALID"
      );
    }

    if (author.role !== "admin") {
      throw new ApiError(
        400,
        "Only an admin can be assigned as a blog author",
        "AUTHOR_ROLE_INVALID"
      );
    }

    // Validate the category if one is assigned.
    if (finalCategoryId) {
      const category = await Category.findById(finalCategoryId).select("name slug contentTypes isActive");
      if (!category) {
        throw new ApiError(
          404,
          "The selected category could not be found",
          "CATEGORY_NOT_FOUND"
        );
      }
      if (!category.contentTypes.includes("blog")) {
        throw new ApiError(
          400,
          "The selected category does not support blogs",
          "CATEGORY_CONTENT_TYPE_INVALID"
        );
      }
      if ( finalStatus === "published" && finalIsActive && !category.isActive ) {
        throw new ApiError(
          400,
          "An active, published blog cannot use an inactive category",
          "CATEGORY_INACTIVE"
        );
      }
    }
    // Validate scheduled blogs.
    if (finalStatus === "scheduled" && !finalScheduledAt) {
      throw new ApiError(
        400,
        "A scheduled date is required for scheduled blogs",
        "SCHEDULED_DATE_REQUIRED"
      );
    }

    // Manage publication timestamps on the server.
    // Never allow the client to choose publishedAt.
    const wasPublished = existingBlog.status === "published";
    const previousPublishedAt = existingBlog.publishedAt;

    if (finalStatus === "published") {
      if (!wasPublished || !previousPublishedAt) {
        // First publication or publishing again after leaving
        // the published status.
        blogData.publishedAt = new Date();
      } else {
        // Editing an already published blog must not reset its date.
        blogData.publishedAt = previousPublishedAt;
      }
    } else {
      // Preserve a previous publication date when moving to draft
      // or scheduled. A never-published blog remains unpublished.
      delete blogData.publishedAt;
    }

    // Remember the existing image before changing the document.
    const oldImage = existingBlog.featuredImage;

    const { featuredImage, ...otherBlogData } = blogData;

    Object.assign(existingBlog, otherBlogData);

    // An omitted image means keep the current image.
    // null explicitly removes it, if accepted by the validation schema.
    if (featuredImage === null) {
      existingBlog.featuredImage = undefined;
      existingBlog.featuredImageAlt = undefined;
    } else if (featuredImage !== undefined) {
      existingBlog.featuredImage = featuredImage;
    }

    // An alt text without an image should not remain on the document.
    if (!existingBlog.featuredImage) {
      existingBlog.featuredImageAlt = undefined;
    }

    // Validate and save before deleting any old uploaded image.
    await existingBlog.validate();
    await existingBlog.save();

    // Only delete the old image if the saved blog no longer references it.
    if (oldImage && oldImage !== existingBlog.featuredImage) {
      try {
        await deleteUploadedImage(oldImage);
      } catch (cleanupError) {
        console.error(
          "[Blog image cleanup] Failed to delete old image:",
          cleanupError
        );
      }
    }
    const updatedBlog = await populateBlog(id);
    if (!updatedBlog) {
      throw new ApiError(
        404,
        "Blog was updated but could not be retrieved",
        "BLOG_RETRIEVAL_FAILED"
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Blog updated successfully",
        blog: blogResponse(updatedBlog),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return handleApiError(
        new ApiError(
          409,
          "A blog with this slug already exists",
          "BLOG_SLUG_EXISTS"
        ),
        request
      );
    }

    return handleApiError(error, request);
  }
}


// DELETE /api/admin/blogs/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    validateBlogId(id);

    await connectDB();

    const blog = await Blog.findById(id);

    if (!blog) {
      throw new ApiError(404, "Blog not found", "BLOG_NOT_FOUND");
    }

    // Save the image URL before deleting the document.
    const imageUrl = blog.featuredImage;

    const deleteResult = await Blog.deleteOne({ _id: blog._id });

    if (deleteResult.deletedCount !== 1) {
      throw new ApiError(
        404,
        "Blog could not be deleted because it no longer exists",
        "BLOG_DELETE_FAILED"
      );
    }

    // Clean up only this blog's own uploaded featured image.
    if (imageUrl?.trim()) {
      try {
        await deleteUploadedImage(imageUrl);
      } catch (cleanupError) {
        console.error(
          "[Blog image cleanup] Failed to delete image:",
          cleanupError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Blog deleted successfully",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return handleApiError(error, request);
  }
}