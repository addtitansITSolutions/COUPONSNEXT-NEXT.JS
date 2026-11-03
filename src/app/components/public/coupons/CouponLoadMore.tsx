
"use client";

import { Loader2 } from "lucide-react";

interface CouponLoadMoreProps {
  observerRef: React.RefObject<HTMLDivElement | null>;
  loadingMore: boolean;
  hasNextPage: boolean;
}

export default function CouponLoadMore({
  observerRef,
  loadingMore,
  hasNextPage,
}: CouponLoadMoreProps) {
  return (
    <div
      ref={observerRef}
      className="flex min-h-16 items-center justify-center py-5"
    >
      {loadingMore && (
        <div
          className="flex items-center gap-2 text-sm text-[var(--muted)]"
          role="status"
        >
          <Loader2
            size={19}
            className="animate-spin text-[var(--brand-purple)]"
          />
          Loading more coupons...
        </div>
      )}

      {!hasNextPage && (
        <p className="text-xs text-[var(--muted)]">
          You've reached the end of the coupons.
        </p>
      )}
    </div>
  );
}
