
import { TicketPercent } from "lucide-react";

interface CouponEmptyStateProps {
  onClear: () => void;
}

export default function CouponEmptyState({
  onClear,
}: CouponEmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] px-5 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--brand-purple)]">
        <TicketPercent size={26} />
      </div>

      <h3 className="text-lg font-bold text-[var(--brand-navy)]">
        No coupons found
      </h3>

      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
        We couldn't find any coupons matching your selected
        filters. Try changing or clearing your filters.
      </p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 rounded-xl border border-[var(--brand-purple)] px-6 py-2.5 text-sm font-bold text-[var(--brand-purple)] transition-colors hover:bg-[var(--accent-light)]"
      >
        Clear Filters
      </button>
    </div>
  );
}
