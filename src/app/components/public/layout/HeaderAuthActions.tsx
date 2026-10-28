"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function HeaderAuthActions() {
    const pathname = usePathname();
    const { user, logout, refreshUser } = useAuth();

    useEffect(() => {
    if (pathname === "/") {
        void refreshUser();
    }
    }, [pathname, refreshUser]);

  if (user) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <div
          className="hidden items-center gap-2 rounded-xl px-3 py-2 sm:flex"
          style={{
            backgroundColor: "var(--accent-light)",
            color: "var(--brand-purple)",
          }}
        >
          <UserRound size={17} />
          <span className="max-w-28 truncate text-sm font-semibold">
            {user.name}
          </span>
        </div>

        <button
          type="button"
          onClick={() => void logout()}
          className="flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-bold sm:px-4"
          style={{
            borderColor: "var(--border)",
            color: "var(--foreground)",
            backgroundColor: "var(--background)",
          }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href="/login"
        className="flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-xs font-bold sm:px-3 sm:text-sm"
        style={{ color: "var(--foreground)" }}
      >
        <LogIn size={16} />
        Login
      </Link>

      <Link
        href="/signup"
        className="flex h-10 items-center justify-center rounded-xl px-3 text-xs font-bold text-white sm:px-4"
        style={{ backgroundColor: "var(--brand-purple)" }}
      >
        Sign up
      </Link>
    </div>
  );
}