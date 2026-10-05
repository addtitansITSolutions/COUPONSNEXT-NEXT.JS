import { z } from "zod";

const categoryContentTypeSchema = z.enum(
  ["store", "coupon", "blog"],
  {
    error: "Content type must be store, coupon, or blog",
  }
);

const categoryContentTypesSchema = z
  .array(categoryContentTypeSchema, {
    error: "Content types must be an array",
  })
  .min(1, "At least one content type is required")
  .refine(
    (types) => new Set(types).size === types.length,
    "Content types cannot contain duplicates"
  );

export const createCategorySchema = z.object({
  name: z
    .string({
      error: "Category name must be a text value",
    })
    .trim()
    .min(1, "Category name is required")
    .max(100, "Category name is too long"),

  slug: z
    .string({
      error: "Category slug must be a text value",
    })
    .trim()
    .min(1, "Category slug is required")
    .max(120, "Category slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  description: z
    .string({
      error: "Category description must be a text value",
    })
    .trim()
    .max(1000, "Description is too long")
    .optional(),

  image: z
    .string({
      error: "Category image must be a text value",
    })
    .trim()
    .max(2000, "Image URL is too long")
    .optional(),

  contentTypes: categoryContentTypesSchema.default([
    "store",
    "coupon",
    "blog",
  ]),

  isActive: z
    .boolean({
      error: "isActive must be true or false",
    })
    .default(true),

  isFeatured: z
    .boolean({
      error: "isFeatured must be true or false",
    })
    .default(false),

  sortOrder: z
    .number({
      error: "Sort order must be a number",
    })
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .default(0),
});

export type CreateCategoryInput = z.infer<
  typeof createCategorySchema
>;






export const updateCategorySchema =
  createCategorySchema.partial();

export type UpdateCategoryInput = z.infer<
  typeof updateCategorySchema
>;











export const categoryQuerySchema = z.object({
  page: z.coerce
    .number({
      error: "Page must be a valid number",
    })
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z.coerce
    .number({
      error: "Limit must be a valid number",
    })
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot be greater than 100")
    .default(10),

  search: z
    .string({
      error: "Search must be a valid text value",
    })
    .trim()
    .max(100, "Search term cannot exceed 100 characters")
    .optional(),

  contentType: categoryContentTypeSchema.optional(),

  isActive: z
    .enum(["true", "false"], {
      error: "isActive must be either true or false",
    })
    .transform((value) => value === "true")
    .optional(),

  isFeatured: z
    .enum(["true", "false"], {
      error: "isFeatured must be either true or false",
    })
    .transform((value) => value === "true")
    .optional(),
});

export type CategoryQueryInput = z.infer<
  typeof categoryQuerySchema
>;