
interface CouponResultsCountProps {
  count: number;
  total?: number;
}

export default function CouponResultsCount({
  count,
  total,
}: CouponResultsCountProps) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <p className="text-sm text-[var(--muted)]">
        Showing{" "}
        <span className="font-bold text-[var(--brand-navy)]">
          {count}
        </span>

        {total !== undefined && (
          <>
            {" "}of{" "}
            <span className="font-bold text-[var(--brand-navy)]">
              {total}
            </span>
          </>
        )}{" "}
        coupons
      </p>
    </div>
  );
}
