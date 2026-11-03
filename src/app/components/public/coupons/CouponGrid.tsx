
import CouponCard, {
  type CouponItem,
} from "@/components/public/coupons/CouponCard";

interface CouponGridProps {
  coupons: CouponItem[];
}

export default function CouponGrid({ coupons }: CouponGridProps) {
  if (coupons.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </div>
  );
}
