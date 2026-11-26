"use client";

import { SubmitEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessageOnUi } from "@/lib/errors/getApiErrorMessageOnUi";
import { toast } from "@/components/ui/toast/toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);

  const clearErrors = () => {
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
  //   console.log("FORM HANDLER FIRED");
  // console.log("defaultPrevented BEFORE:", event.defaultPrevented);

  event.preventDefault();

  // console.log("defaultPrevented AFTER:", event.defaultPrevented);

    if (isSubmitting) return;

    setErrors([]);

    const trimmedEmail = email.trim();

    // --------------------------------
    // Client-side validation
    // --------------------------------

    const validationErrors: string[] = [];

    if (!trimmedEmail) {
      validationErrors.push("Please enter your email address.");
    }

    if (!password) {
      validationErrors.push("Please enter your password.");
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(trimmedEmail, password);

      if (!result.success) {
        const apiError = getApiErrorMessageOnUi(
          result,
          "Unable to log in. Please try again."
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
      // Redirect based on role
      // --------------------------------

      if (result.user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      toast.success("Logged in successfully");

      router.refresh();
    } catch {
      setErrors([
        "Something went wrong. Please check your connection and try again.",
      ]);
      toast.error("Something went wrong. Please check your connection and try again." );
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

            <p className="mt-2 text-sm text-[var(--brand-navy)]/55">
              Log in to your CouponsNext account
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
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearErrors();
                    }}
                    placeholder="Enter your password"
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
                      showPassword
                        ? "Hide password"
                        : "Show password"
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-purple)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--brand-purple)]/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </form>

            {/* Signup */}
            <div className="mt-6 border-t border-[var(--border)] pt-6 text-center">
              <p className="text-sm text-[var(--brand-navy)]/55">
                Don&lsquo;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-[var(--brand-purple)] transition hover:underline"
                >
                  Create account
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