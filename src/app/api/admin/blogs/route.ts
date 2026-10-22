import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth-guards";
import { createBlogSchema, blogQuerySchema, } from "@/lib/validations/blog";
import { handleApiError } from "@/lib/errors/handleApiError";
import { ApiError } from "@/lib/errors/ApiError";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
import User from "@/models/User";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const query = blogQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );
    if (!query.success) {
      throw query.error;
    }
    const {
      page,
      limit,
      search,
      category,
      author,
      status,
      isActive,
      isFeatured,
    } = query.data;
    await connectDB();
    const filter: Record<string, unknown> = {};
    if (search) {
      const searchRegex = {
        $regex: escapeRegex(search),
        $options: "i",
      };
      filter.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { excerpt: searchRegex },
        { tags: searchRegex },
        { seoTitle: searchRegex },
      ];
    }

    if (category === "__none__") {
      // Match blogs without a category.
      filter.category = null;
    } else if (category) {
      filter.category = new Types.ObjectId(category);
    }

    if (author) {
      filter.author = new Types.ObjectId(author);
    }

    if (status) {
      filter.status = status;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select(
          "title slug excerpt featuredImage featuredImageAlt author category tags status isActive isFeatured sortOrder viewCount publishedAt scheduledAt seoTitle seoDescription canonicalUrl noIndex ogTitle ogDescription ogImage createdAt updatedAt"
        )
        .sort({
          sortOrder: 1,
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(limit)
        .populate("author", "name email")
        .populate("category", "name slug")
        .lean(),

      Blog.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        blogs: blogs.map((blog) => {
          const populatedAuthor = blog.author as unknown as {
            _id: Types.ObjectId;
            name: string;
            email: string;
          } | null;

          const populatedCategory = blog.category as unknown as {
            _id: Types.ObjectId;
            name: string;
            slug: string;
          } | null;

          return {
            id: blog._id.toString(),
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            featuredImage: blog.featuredImage,
            featuredImageAlt: blog.featuredImageAlt,
            author: populatedAuthor
              ? {
                  id: populatedAuthor._id.toString(),
                  name: populatedAuthor.name,
                  email: populatedAuthor.email,
                }
              : null,
            category: populatedCategory
              ? {
                  id: populatedCategory._id.toString(),
                  name: populatedCategory.name,
                  slug: populatedCategory.slug,
                }
              : null,
            tags: blog.tags,
            status: blog.status,
            isActive: blog.isActive,
            isFeatured: blog.isFeatured,
            sortOrder: blog.sortOrder,
            viewCount: blog.viewCount,
            publishedAt: blog.publishedAt,
            scheduledAt: blog.scheduledAt,
            seoTitle: blog.seoTitle,
            seoDescription: blog.seoDescription,
            canonicalUrl: blog.canonicalUrl,
            noIndex: blog.noIndex,
            ogTitle: blog.ogTitle,
            ogDescription: blog.ogDescription,
            ogImage: blog.ogImage,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
          };
        }),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
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

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const validation = createBlogSchema.safeParse(body);
    if (!validation.success) {
      throw validation.error;
    }
    const blogData = validation.data;
    await connectDB();
    // Verify that the selected author exists and is active.
    const author = await User.findById(blogData.author).select("name email role isActive").lean();
    if (!author) {
      throw new ApiError(
        404,
        "The selected author could not be found",
        "AUTHOR_NOT_FOUND"
      );
    }

    if (!author.isActive) {
      throw new ApiError(
        400,
        "An inactive user cannot be assigned as a blog author",
        "AUTHOR_INACTIVE"
      );
    }

    if(author.role !== "admin"){
        throw new ApiError(
        400,
        "Only admin can be assigned as a blog author",
        "AUTHOR_INACTIVE"
      );
    }

    // Verify that the selected category supports blogs.
    if (blogData.category) {
      const category = await Category.findById(blogData.category)
        .select("name slug isActive contentTypes")
        .lean();

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
          "INVALID_CATEGORY_TYPE"
        );
      }

      if ( blogData.status !== "draft" && !category.isActive) {
        throw new ApiError(
          400,
          "Blogs cannot be published in an inactive category",
          "CATEGORY_INACTIVE"
        );
      }
    }

    
    if (blogData.status === "published") {
      blogData.publishedAt = new Date();
    }


    // Prevent duplicate slugs.
    const existingBlog = await Blog.exists({ slug: blogData.slug, });

    if (existingBlog) {
      throw new ApiError(
        409,
        "A blog with this slug already exists",
        "BLOG_SLUG_EXISTS"
      );
    }

    const blog = await Blog.create({
      ...blogData,
      // The counter is always initialized by the server.
      viewCount: 0,
    });

    await blog.populate([
      {
        path: "author",
        select: "name email",
      },
      {
        path: "category",
        select: "name slug",
      },
    ]);

    const result = blog.toObject();

    const populatedAuthor = result.author as unknown as {
      _id: Types.ObjectId;
      name: string;
      email: string;
    } | null;

    const populatedCategory = result.category as unknown as {
      _id: Types.ObjectId;
      name: string;
      slug: string;
    } | null;

    return NextResponse.json(
      {
        success: true,
        message: "Blog created successfully",
        blog: {
          id: blog._id.toString(),
          title: result.title,
          slug: result.slug,
          excerpt: result.excerpt,
          content: result.content,
          featuredImage: result.featuredImage,
          featuredImageAlt: result.featuredImageAlt,
          author: populatedAuthor
            ? {
                id: populatedAuthor._id.toString(),
                name: populatedAuthor.name,
                email: populatedAuthor.email,
              }
            : null,
          category: populatedCategory
            ? {
                id: populatedCategory._id.toString(),
                name: populatedCategory.name,
                slug: populatedCategory.slug,
              }
            : null,
          tags: result.tags,
          status: result.status,
          isActive: result.isActive,
          isFeatured: result.isFeatured,
          sortOrder: result.sortOrder,
          viewCount: result.viewCount,
          publishedAt: result.publishedAt,
          scheduledAt: result.scheduledAt,
          seoTitle: result.seoTitle,
          seoDescription: result.seoDescription,
          canonicalUrl: result.canonicalUrl,
          noIndex: result.noIndex,
          ogTitle: result.ogTitle,
          ogDescription: result.ogDescription,
          ogImage: result.ogImage,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      },
      {
        status: 201,
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
