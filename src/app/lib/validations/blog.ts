import { z } from "zod";

const blogStatusSchema = z.enum(
  ["draft", "published", "scheduled"],
  {
    error: "Blog status must be draft, published, or scheduled",
  }
);

const optionalTextSchema = (maxLength: number, fieldName: string) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? undefined : value,
    z
      .string({
        error: `${fieldName} must be a text value`,
      })
      .trim()
      .max(maxLength, `${fieldName} is too long`)
      .optional()
  );

const optionalDateSchema = z.preprocess(
  (value) =>
    value === "" || value === null || value === undefined
      ? undefined
      : value,
  z.coerce
    .date({
      error: "Please enter a valid date",
    })
    .optional()
);

const optionalImageSchema = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === ""
      ? undefined
      : value,
  z
    .string({
      error: "Image must be a text value",
    })
    .trim()
    .max(500, "Image path is too long")
    .optional()
);

const optionalObjectIdSchema = ( fieldName: string, allowNone = false ) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === ""
        ? undefined
        : value,
    z
      .string({
        error: `${fieldName} must be a text value`,
      })
      .refine(
        (value) =>
          (allowNone && value === "__none__") ||
          /^[a-f\d]{24}$/i.test(value),
        `Please select a valid ${fieldName.toLowerCase()}`
      )
      .optional()
  );

const httpUrlSchema = z
  .string({
    error: "URL must be a text value",
  })
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

const optionalUrlSchema = (fieldName: string) =>
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
      .url(`Please enter a valid ${fieldName.toLowerCase()}`)
      .refine(
        (value) => {
          try {
            const url = new URL(value);
            return ["http:", "https:"].includes(url.protocol);
          } catch {
            return false;
          }
        },
        `${fieldName} must use HTTP or HTTPS`
      )
      .optional()
  );

// Tiptap document JSON
const blogContentSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (value) => value.type === "doc",
    "Blog content must be a valid rich-text document"
  );

const blogFieldsSchema = z.object({
  title: z
    .string({
      error: "Blog title must be a text value",
    })
    .trim()
    .min(1, "Blog title is required")
    .max(200, "Blog title is too long"),

  slug: z
    .string({
      error: "Blog slug must be a text value",
    })
    .trim()
    .min(1, "Blog slug is required")
    .max(200, "Blog slug is too long")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),

  excerpt: z
    .string({
      error: "Blog excerpt must be a text value",
    })
    .trim()
    .min(1, "Blog excerpt is required")
    .max(500, "Blog excerpt is too long"),

  content: blogContentSchema,

  featuredImage: optionalImageSchema,

  featuredImageAlt: optionalTextSchema(
    250,
    "Featured image alt text"
  ),

  author: z
    .string({
      error: "Author ID must be a text value",
    })
    .regex(
      /^[a-f\d]{24}$/i,
      "Please select a valid author"
    ),

  category: optionalObjectIdSchema("Category"),

  tags: z
    .array(
      z
        .string({
          error: "Each tag must be a text value",
        })
        .trim()
        .min(1, "Tags cannot be empty")
        .max(50, "Each tag cannot exceed 50 characters")
    )
    .max(20, "A blog can have at most 20 tags")
    .default([]),

  status: blogStatusSchema,

  isActive: z.boolean({
    error: "isActive must be true or false",
  }),

  isFeatured: z.boolean({
    error: "isFeatured must be true or false",
  }),

  sortOrder: z
    .number({
      error: "Sort order must be a number",
    })
    .int("Sort order must be a whole number")
    .min(0, "Sort order cannot be negative")
    .default(0),

  publishedAt: optionalDateSchema,

  scheduledAt: optionalDateSchema,

  seoTitle: optionalTextSchema(70, "SEO title"),

  seoDescription: optionalTextSchema(170, "SEO description"),

  canonicalUrl: optionalUrlSchema("Canonical URL"),

  noIndex: z.boolean().default(false),

  ogTitle: optionalTextSchema(100, "Open Graph title"),

  ogDescription: optionalTextSchema(
    200,
    "Open Graph description"
  ),

  ogImage: optionalImageSchema,
});

function validateBlogRules(
  blog: {
    status?: "draft" | "published" | "scheduled";
    scheduledAt?: Date;
    publishedAt?: Date;
    featuredImage?: string;
    featuredImageAlt?: string;
  },
  ctx: z.RefinementCtx
) {
  if (blog.status === "scheduled" && !blog.scheduledAt) {
    ctx.addIssue({
      code: "custom",
      path: ["scheduledAt"],
      message: "Scheduled publication date is required",
    });
  }

  if (
    blog.status === "scheduled" &&
    blog.scheduledAt &&
    blog.publishedAt &&
    blog.scheduledAt.getTime() !== blog.publishedAt.getTime()
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["publishedAt"],
      message:
        "A scheduled blog cannot have a different publication date",
    });
  }

  if (
    !blog.featuredImage &&
    blog.featuredImageAlt?.trim()
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["featuredImageAlt"],
      message: "Add a featured image or clear its alt text",
    });
  }
}

export const createBlogSchema = blogFieldsSchema
  .extend({
    status: blogStatusSchema.default("draft"),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
    tags: blogFieldsSchema.shape.tags.default([]),
    noIndex: z.boolean().default(false),
  })
  .superRefine(validateBlogRules);

export type CreateBlogInput = z.infer<typeof createBlogSchema>;



















export const updateBlogSchema = blogFieldsSchema
  .partial()
  .omit({
    // These fields are assigned/managed by the server.
  })
  .superRefine(validateBlogRules);

export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;














export const blogQuerySchema = z.object({
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

  category: z
    .union([
      z.literal("__none__"),
      z.string().regex(
        /^[a-f\d]{24}$/i,
        "Please select a valid category"
      ),
    ])
    .optional(),

  author: z
    .string()
    .regex(/^[a-f\d]{24}$/i, "Please select a valid author")
    .optional(),

  status: blogStatusSchema.optional(),

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

export type BlogQueryInput = z.infer<typeof blogQuerySchema>;