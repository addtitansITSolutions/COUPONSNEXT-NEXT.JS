import { z } from "zod";
const storeIdSchema = z
  .string({ error: "Store ID must be a text value" })
  .trim()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Store ID must be a valid MongoDB ObjectId"
  );

const countrySchema = z
  .string({ error: "Country must be a valid text value" })
  .trim()
  .length(2, "Country must be a 2-letter country code")
  .transform((value) => value.toUpperCase());

const imageUrlSchema = z
  .string({ error: "Banner image must be a text value" })
  .trim()
  .min(1, "Banner image is required")
  .max(2000, "Banner image URL is too long");

const httpUrlSchema = z
  .string({ error: "URL must be a text value" })
  .trim()
  .url("Please enter a valid URL")
  .refine(
    (value) => {
      try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol);
      } catch {
        return false;
      }
    },
    "URL must use HTTP or HTTPS"
  );

export const createBannerSchema = z.object({
  title: z
    .string({ error: "Banner title must be a text value" })
    .trim()
    .min(1, "Banner title is required")
    .max(150, "Banner title is too long"),

  subtitle: z
    .string({ error: "Banner subtitle must be a text value" })
    .trim()
    .max(300, "Banner subtitle is too long")
    .optional(),

  desktopImage: imageUrlSchema,

  mobileImage: imageUrlSchema,

  store: storeIdSchema,

  affiliateUrl: httpUrlSchema,

  country: countrySchema,

  isActive: z
    .boolean({ error: "isActive must be true or false" })
    .default(true),

  sortOrder: z
    .number({ error: "Sort order must be a number" })
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .default(0),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;







export const updateBannerSchema = createBannerSchema.partial();

export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;








export const bannerQuerySchema = z.object({
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
    .default(10),

  search: z
    .string({ error: "Search must be a valid text value" })
    .trim()
    .max(100, "Search term cannot exceed 100 characters")
    .optional(),

  store: storeIdSchema.optional(),

  isActive: z
    .enum(["true", "false"], {
      error: "isActive must be either true or false",
    })
    .transform((value) => value === "true")
    .optional(),

  country: countrySchema.optional(),
});

export type BannerQueryInput = z.infer< typeof bannerQuerySchema >;