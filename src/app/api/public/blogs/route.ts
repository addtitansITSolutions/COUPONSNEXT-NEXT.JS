
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { handleApiError } from "@/lib/errors/handleApiError";

import Blog from "@/models/Blog";
import Category from "@/models/Category";
import User from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- query validation ---------- */

const publicBlogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),

  search: z.string().trim().max(100).optional(),

  category: z.string().trim().min(1).max(150).optional(),

  tag: z.string().trim().min(1).max(100).optional(),

  isFeatured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  sort: z
  .enum(["default", "latest", "oldest", "popular"])
  .default("default"),
});

/* ---------- helpers ---------- */

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeFeaturedImage(value?: string | null) {
  if (!value) return "";

  let image = value.trim();

  // Handle accidentally stored Markdown image links.
  const markdownMatch = image.match(/^\[.*?\]\((.*?)\)$/);

  if (markdownMatch?.[1]) {
    image = markdownMatch[1].trim();
  }

  // Convert localhost image URLs into their public upload paths.
  try {
    const url = new URL(image);

    if (
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1"
    ) {
      return `${url.pathname}${url.search}`;
    }

    return image;
  } catch {
    return image;
  }
}

const sortOptions = {
  default: {
    sortOrder: 1,
    publishedAt: -1,
    _id: -1,
  },

  latest: {
    publishedAt: -1,
    _id: -1,
  },

  oldest: {
    publishedAt: 1,
    _id: 1,
  },

  popular: {
    viewCount: -1,
    publishedAt: -1,
    _id: -1,
  },
} as const;

function emptyBlogsResponse(page: number, limit: number) {
  return NextResponse.json(
    {
      success: true,
      blogs: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
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
}

/* ---------- GET ---------- */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = publicBlogQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!queryResult.success) {
      throw queryResult.error;
    }

    const {
      page,
      limit,
      search,
      category,
      tag,
      isFeatured,
      sort,
    } = queryResult.data;

    await connectDB();

    const now = new Date();

    /* ---------- active authors ---------- */

    // Filter authors BEFORE pagination.
    const activeAuthorIds = await User.distinct("_id", {
      isActive: true,
    });

    /* ---------- base filter ---------- */

    const filter: Record<string, any> = {
      status: "published",
      isActive: true,
      publishedAt: {
        $lte: now,
      },
      author: {
        $in: activeAuthorIds,
      },
    };

    /* ---------- category filter ---------- */

    if (category) {
      const activeCategory = await Category.findOne({
        slug: category,
        isActive: true,
        contentTypes: "blog",
      })
        .select("_id")
        .lean();

      if (!activeCategory) {
        return emptyBlogsResponse(page, limit);
      }

      filter.category = activeCategory._id;
    }

    /* ---------- featured filter ---------- */

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    /* ---------- tag filter ---------- */

    if (tag) {
      filter.tags = {
        $regex: `^${escapeRegex(tag)}$`,
        $options: "i",
      };
    }

    /* ---------- search filter ---------- */

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
      ];
    }

    /* ---------- pagination ---------- */

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select(
          "title slug excerpt featuredImage featuredImageAlt author category tags isFeatured sortOrder viewCount publishedAt createdAt"
        )
        .sort(sortOptions[sort])
        .skip(skip)
        .limit(limit)
        .populate({
          path: "author",
          select: "name isActive",
        })
        .populate({
          path: "category",
          model: Category,
          select: "name slug isActive contentTypes",
        })
        .lean(),

      Blog.countDocuments(filter),
    ]);

    /* ---------- response mapping ---------- */

    const formattedBlogs = blogs.map((blog) => {
      const populatedAuthor = blog.author as unknown as {
        _id: Types.ObjectId;
        name: string;
        isActive: boolean;
      } | null;

      const populatedCategory = blog.category as unknown as {
        _id: Types.ObjectId;
        name: string;
        slug: string;
        isActive: boolean;
        contentTypes?: string[];
      } | null;

      const validCategory =
        populatedCategory?.isActive === true &&
        populatedCategory.contentTypes?.includes("blog") === true
          ? populatedCategory
          : null;

      return {
        id: blog._id.toString(),

        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,

        featuredImage: normalizeFeaturedImage(
          blog.featuredImage
        ),

        featuredImageAlt: blog.featuredImageAlt ?? "",

        author: populatedAuthor
          ? {
              id: populatedAuthor._id.toString(),
              name: populatedAuthor.name,
            }
          : {
              id: "",
              name: "CouponsNext",
            },

        category: validCategory
          ? {
              id: validCategory._id.toString(),
              name: validCategory.name,
              slug: validCategory.slug,
            }
          : null,

        tags: blog.tags ?? [],

        isFeatured: blog.isFeatured,
        viewCount: blog.viewCount,

        publishedAt: blog.publishedAt ?? null,
        createdAt: blog.createdAt,
      };
    });

    const totalPages = Math.ceil(total / limit);

    /* ---------- final response ---------- */

    return NextResponse.json(
      {
        success: true,
        blogs: formattedBlogs,

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
