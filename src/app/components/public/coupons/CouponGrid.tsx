
import CouponCard, {
  type CouponItem,
} from "@/components/public/coupons/CouponCard";

interface CouponGridProps {
  coupons: CouponItem[];
  showDesktopFilters?: boolean;
}

export default function CouponGrid({
  coupons,
  showDesktopFilters = false,
}: CouponGridProps) {
  if (coupons.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:mb-20 ${
        showDesktopFilters
          ? "lg:grid-cols-3"
          : "lg:grid-cols-4"
      }`}
    >
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </div>
  );
}
