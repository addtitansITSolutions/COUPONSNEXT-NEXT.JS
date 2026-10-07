"use client";

import { SubmitEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";
import { toast } from "@/components/ui/toast/toast";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const clearErrors = () => {
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) return;

    setErrors([]);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // --------------------------------
    // Client-side validation
    // --------------------------------

    const validationErrors: string[] = [];

    if (!trimmedName) {
      validationErrors.push("Please enter your name.");
    } else if (trimmedName.length < 2) {
      validationErrors.push("Name must be at least 2 characters.");
    }

    if (!trimmedEmail) {
      validationErrors.push("Please enter your email address.");
    }

    if (!password) {
      validationErrors.push("Please enter a password.");
    } else if (password.length < 8) {
      validationErrors.push("Password must be at least 8 characters.");
    }

    if (!confirmPassword) {
      validationErrors.push("Please confirm your password.");
    } else if (password !== confirmPassword) {
      validationErrors.push("Passwords do not match.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // --------------------------------
      // Create account
      // --------------------------------

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
        }),
      });

      const data = await response.json();

      // --------------------------------
      // API error
      // --------------------------------

      if (!response.ok) {
        const apiError = getApiErrorMessageOnUi(
          data,
          "Unable to create your account. Please try again."
        );

        setErrors(
          apiError
            .split("\n")
            .map((message) => message.trim())
            .filter(Boolean)
        );

        return;
      }

      // --------------------------------
      // Unexpected success response
      // --------------------------------

      if (!data.success || !data.user) {
        setErrors([
          "Unable to create your account. Please try again.",
        ]);

        return;
      }

      // --------------------------------
      // Automatically log the user in
      // --------------------------------

      const loginResult = await login(trimmedEmail, password);

      if (!loginResult.success) {
        router.push("/login");
        return;
      }

      // --------------------------------
      // Redirect based on role
      // --------------------------------

      if (loginResult.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      toast.success("Account created successfully");

      router.refresh();
    } catch {
      setErrors([
        "Something went wrong. Please check your connection and try again.",
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-block text-3xl font-bold tracking-tight"
            >
              <span className="text-[var(--brand-purple)]">Coupons</span>
              <span className="text-[var(--brand-yellow)]">Next</span>
            </Link>

            {/* <h1 className="mt-6 text-2xl font-bold text-[var(--brand-navy)]">
              Create your account
            </h1> */}

            <p className="mt-2 text-sm text-[var(--brand-navy)]/55">
              Create your account
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5" method="post">
              {/* Errors */}
              {errors.length > 0 && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  <ul className="list-disc space-y-1 pl-5">
                    {errors.map((error, index) => (
                      <li key={`${error}-${index}`}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
                >
                  Full name
                </label>

                <div className="relative">
                  <User
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-navy)]/35"
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      clearErrors();
                    }}
                    placeholder="Your name"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-11 pr-4 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/30 focus:border-[var(--brand-purple)] focus:ring-3 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-navy)]/35"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      clearErrors();
                    }}
                    placeholder="you@example.com"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-11 pr-4 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/30 focus:border-[var(--brand-purple)] focus:ring-3 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-navy)]/35"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearErrors();
                    }}
                    placeholder="At least 8 characters"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-11 pr-12 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/30 focus:border-[var(--brand-purple)] focus:ring-3 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    disabled={isSubmitting}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--brand-navy)]/40 transition hover:text-[var(--brand-purple)] disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[var(--brand-navy)]"
                >
                  Confirm password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--brand-navy)]/35"
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      clearErrors();
                    }}
                    placeholder="Enter your password again"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-11 pr-12 text-sm text-[var(--brand-navy)] outline-none transition placeholder:text-[var(--brand-navy)]/30 focus:border-[var(--brand-purple)] focus:ring-3 focus:ring-[var(--brand-purple)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    disabled={isSubmitting}
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--brand-navy)]/40 transition hover:text-[var(--brand-purple)] disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-purple)]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            {/* Login */}
            <div className="mt-6 border-t border-[var(--border)] pt-6 text-center">
              <p className="text-sm text-[var(--brand-navy)]/55">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[var(--brand-purple)] transition hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--brand-navy)]/45 transition hover:text-[var(--brand-purple)]"
            >
              ← Back to CouponsNext
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}