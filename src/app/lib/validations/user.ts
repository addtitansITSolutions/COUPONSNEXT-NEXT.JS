import { z } from "zod";
export const userRoleSchema = z.enum(["admin", "user"]);
export const userQuerySchema = z.object({
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

  role: userRoleSchema.optional(),

  isActive: z
    .enum(["true", "false"], {
      error: "isActive must be either true or false",
    })
    .transform((value) => value === "true")
    .optional(),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;




export const userUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .optional(),

    role: userRoleSchema.optional(),

    isActive: z.boolean().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required"
  );

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

