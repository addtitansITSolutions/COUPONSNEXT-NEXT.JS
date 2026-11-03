
import { TicketPercent } from "lucide-react";

interface CouponErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function CouponErrorState({
  message,
  onRetry,
}: CouponErrorStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-5 py-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-light)] text-[var(--brand-purple)]">
        <TicketPercent size={26} />
      </div>

      <h3 className="text-lg font-bold text-[var(--brand-navy)]">
        Unable to load coupons
      </h3>

      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-xl bg-[var(--brand-purple)] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--accent-hover)]"
      >
        Try Again
      </button>
    </div>
  );
}
