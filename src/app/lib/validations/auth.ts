import { z } from "zod";

export const loginSchema = z.object({
  email: z
  .string()
  .trim()
  .pipe(z.email("Please enter a valid email address"))
  .transform((val) => val.toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password is too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;









export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),

  email: z
  .string()
  .trim()
  .pipe(z.email("Please enter a valid email address"))
  .transform((val) => val.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

export type SignupInput = z.infer<typeof signupSchema>;