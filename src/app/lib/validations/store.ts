import { z } from "zod";

const categoryIdSchema = z
  .string({ error: "Category ID must be a text value" })
  .trim()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Category ID must be a valid MongoDB ObjectId"
  );




export const createStoreSchema = z.object({
  name: z
    .string({ error: "Store name must be a text value" })
    .trim()
    .min(1, "Store name is required")
    .max(100, "Store name is too long"),

  slug: z
    .string({ error: "Store slug must be a text value" })
    .trim()
    .min(1, "Store slug is required")
    .max(120, "Store slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  description: z
    .string({ error: "Store description must be a text value" })
    .trim()
    .max(2000, "Store description is too long")
    .optional(),

  logo: z
    .string({ error: "Store logo must be a text value" })
    .trim()
    .max(2000, "Store logo URL is too long")
    .optional(),

  storeBanner: z
    .string({ error: "Store banner must be a text value" })
    .trim()
    .max(2000, "Store banner URL is too long")
    .optional(),

  websiteUrl: z
    .string({ error: "Website URL must be a text value" })
    .trim()
    .url("Please enter a valid website URL")
    .optional(),

  affiliateUrl: z
    .string({ error: "Affiliate URL must be a text value" })
    .trim()
    .url("Please enter a valid affiliate URL")
    .optional(),

  country: z
    .string({ error: "Country must be a text value" })
    .trim()
    .length(2, "Country must be a 2-letter country code")
    .transform((value) => value.toUpperCase())
    .optional(),

  category: categoryIdSchema.optional(),

  isActive: z
    .boolean({ error: "isActive must be true or false" })
    .default(true),

  isFeatured: z
    .boolean({ error: "isFeatured must be true or false" })
    .default(false),

  sortOrder: z
    .number({ error: "Sort order must be a number" })
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .default(0),
});
export type CreateStoreInput = z.infer<typeof createStoreSchema>;





export const updateStoreSchema = createStoreSchema.partial();
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;





export const storeQuerySchema = z.object({
  page: z
    .coerce
    .number({ error: "Page must be a valid number" })
    .int("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z
    .coerce
    .number({ error: "Limit must be a valid number" })
    .int("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot be greater than 100")
    .default(2),

  search: z
    .string({ error: "Search must be a valid text value" })
    .trim()
    .max(100, "Search term cannot exceed 100 characters")
    .optional(),

  category: categoryIdSchema.optional(),

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

  country: z
    .string({ error: "Country must be a valid text value" })
    .trim()
    .length(2, "Country must be a 2-letter country code")
    .transform((value) => value.toUpperCase())
    .optional(),
});
export type StoreQueryInput = z.infer<typeof storeQuerySchema>;