import { z } from "zod";

const couponTypeSchema = z.enum(["code", "deal"], {
  error: "Coupon type must be code or deal",
});

const couponStatusSchema = z.enum(
  ["draft", "published", "expired"],
  {
    error: "Coupon status must be draft, published, or expired",
  }
);

const optionalTextSchema = (maxLength: number, fieldName: string) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? undefined
        : value,
    z
      .string({
        error: `${fieldName} must be a text value`,
      })
      .trim()
      .max(maxLength, `${fieldName} is too long`)
      .optional()
  );

const httpUrlSchema = z
.string({
    error: "Affiliate URL must be a text value",
  })
  .trim()
  .url("Please enter a valid affiliate URL")
  .refine(
    (value) => {
      try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol);
      } catch {
        return false;
      }
    },
    "Affiliate URL must use HTTP or HTTPS"
  );

const optionalDateSchema = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? undefined
      : value,
  z.coerce.date({
    error: "Please enter a valid date",
  }).optional()
);

const couponFieldsSchema = z.object({
  title: z
    .string({
      error: "Coupon title must be a text value",
    })
    .trim()
    .min(1, "Coupon title is required")
    .max(200, "Coupon title is too long"),

  slug: z
    .string({
      error: "Coupon slug must be a text value",
    })
    .trim()
    .min(1, "Coupon slug is required")
    .max(220, "Coupon slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  description: z
    .string({
      error: "Coupon description must be a text value",
    })
    .trim()
    .min(1, "Coupon description is required")
    .max(2000, "Coupon description is too long"),

  type: couponTypeSchema,

  code: optionalTextSchema(100, "Coupon code"),

  image: optionalTextSchema(500, "Coupon image"),

  store: z
    .string({
      error: "Store ID must be a text value",
    })
    .regex(
      /^[a-f\d]{24}$/i,
      "Please select a valid store"
    ),

  category: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? undefined
        : value,
    z
      .string({
        error: "Category ID must be a text value",
      })
      .regex(
        /^[a-f\d]{24}$/i,
        "Please select a valid category"
      )
      .optional()
  ),

  discount: optionalTextSchema(100, "Discount"),

  affiliateUrl: httpUrlSchema,

  country: z
    .string({
      error: "Country must be a text value",
    })
    .trim()
    .regex(
      /^[a-zA-Z]{2}$/,
      "Country must be a two-letter country code"
    )
    .transform((value) => value.toUpperCase()),

  startsAt: optionalDateSchema,

  expiresAt: optionalDateSchema,

  status: couponStatusSchema.default("draft"),

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

  isVerified: z
    .boolean({
      error: "isVerified must be true or false",
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

function validateCouponRules(
  coupon: {
    type?: "code" | "deal";
    code?: string;
    startsAt?: Date;
    expiresAt?: Date;
  },
  ctx: z.RefinementCtx
) {
  if (coupon.type === "code" && !coupon.code?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["code"],
      message: "Coupon code is required for code-type coupons",
    });
  }

  if (coupon.type === "deal" && coupon.code?.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["code"],
      message: "Deal coupons must not contain a coupon code",
    });
  }

  if (
    coupon.startsAt &&
    coupon.expiresAt &&
    coupon.expiresAt <= coupon.startsAt
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["expiresAt"],
      message: "Expiry date must be after the start date",
    });
  }
}

export const createCouponSchema = couponFieldsSchema.superRefine(
  validateCouponRules
);
export type CreateCouponInput = z.infer< typeof createCouponSchema >;
















export const updateCouponSchema = couponFieldsSchema.partial().superRefine(validateCouponRules);

export type UpdateCouponInput = z.infer< typeof updateCouponSchema >;











export const couponQuerySchema = z.object({
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
    .default(20),

  search: z
    .string({
      error: "Search must be a valid text value",
    })
    .trim()
    .max(100, "Search term cannot exceed 100 characters")
    .optional(),

  store: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Please select a valid store")
    .optional(),

  category: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Please select a valid category")
    .optional(),

  type: couponTypeSchema.optional(),

  status: couponStatusSchema.optional(),

  country: z
    .string()
    .regex(/^[a-zA-Z]{2}$/, "Country must be a two-letter country code")
    .transform((value) => value.toUpperCase())
    .optional(),

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

  isVerified: z
    .enum(["true", "false"], {
      error: "isVerified must be either true or false",
    })
    .transform((value) => value === "true")
    .optional(),
});

export type CouponQueryInput = z.infer< typeof couponQuerySchema >;
