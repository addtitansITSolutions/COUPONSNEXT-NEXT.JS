
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { handleApiError } from "@/lib/errors/handleApiError";
import Category from "@/models/Category";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const contentTypeSchema = z.enum(["store", "coupon", "blog"]);

const publicCategoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
  search: z.string().trim().max(100).optional(),
  letter: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]$/, "Invalid alphabet letter.")
    .optional(),

  // Comma-separated content types. Empty means all types.
  contentTypes: z.string().optional().transform((value, ctx) => {
    if (!value?.trim()) return [];

    const values = [
      ...new Set(
        value.split(",").map((item) => item.trim()).filter(Boolean)
      ),
    ];

    const result = z.array(contentTypeSchema).safeParse(values);

    if (!result.success) {
      ctx.addIssue({
        code: "custom",
        message: "Invalid content type selection.",
      });
      return z.NEVER;
    }

    return result.data;
  }),

  sort: z.enum(["manual", "alphabetical"]).default("manual"),
  featured: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryResult = publicCategoryQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!queryResult.success) {
      throw queryResult.error;
    }

    const {
      page,
      limit,
      search,
      letter,
      contentTypes,
      sort,
      featured,
    } = queryResult.data;

    await connectDB();

    const filter: Record<string, unknown> = {
      isActive: true,
    };

    // Match categories associated with ANY selected content type.
    // When none are selected, return all active categories.
    if (contentTypes.length > 0) {
      filter.contentTypes = { $in: contentTypes };
    }

    const nameConditions: Record<string, unknown>[] = [];

    if (search) {
      nameConditions.push({
        name: {
          $regex: escapeRegex(search),
          $options: "i",
        },
      });
    }

    if (letter) {
      nameConditions.push({
        name: {
          $regex: `^${letter}`,
          $options: "i",
        },
      });
    }

    if (nameConditions.length > 0) {
      filter.$and = nameConditions;
    }

    if (featured !== undefined) {
      filter.isFeatured = featured;
    }

    // Use a consistent alphabetical sort with a stable tie-breaker.
    const sortOptions: Record<string, 1 | -1> =
      letter || sort === "alphabetical"
        ? { name: 1, _id: 1 }
        : { sortOrder: 1, name: 1, _id: 1 };

    const skip = (page - 1) * limit;

    // Available letters should respect selected content types,
    // but not the current search, letter, or featured filter.
    const lettersFilter: Record<string, unknown> = {
      isActive: true,
    };

    if (contentTypes.length > 0) {
      lettersFilter.contentTypes = { $in: contentTypes };
    }

    const [categories, total, categoryNames] = await Promise.all([
      Category.find(filter)
        .select(
          "name slug description image contentTypes isFeatured sortOrder createdAt"
        )
        .collation({ locale: "en", strength: 2 })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),

      Category.countDocuments(filter),

      Category.distinct("name", lettersFilter),
    ]);

    const availableLetters = Array.from(
      new Set(
        categoryNames
          .map((name) => name.trim().charAt(0).toUpperCase())
          .filter((letter) => /^[A-Z]$/.test(letter))
      )
    ).sort();

    const formattedCategories = categories.map((category) => ({
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      image: category.image ?? "",
      contentTypes: category.contentTypes,
      isFeatured: category.isFeatured,
      sortOrder: category.sortOrder,
      createdAt: category.createdAt,
    }));

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        categories: formattedCategories,
        availableLetters,
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
