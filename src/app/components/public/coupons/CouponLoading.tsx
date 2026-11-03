
import { Loader2 } from "lucide-react";

export default function CouponLoading() {
  return (
    <div
      className="flex min-h-[300px] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2
          size={32}
          className="animate-spin text-[var(--brand-purple)]"
        />

        <p className="text-sm text-[var(--muted)]">
          Loading coupons...
        </p>
      </div>
    </div>
  );
}
