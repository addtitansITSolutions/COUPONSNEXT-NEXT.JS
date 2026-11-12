
import Link from "next/link";
import {
  BadgeCheck,
  ArrowRight,
  Search,
  Tag,
  Copy,
  ShoppingBag,
  Lightbulb,
  Sparkles,
} from "lucide-react";

const savingSteps = [
  {
    icon: Search,
    title: "Find your category",
    description:
      "Explore categories to discover offers for the products you actually need.",
  },
  {
    icon: BadgeCheck,
    title: "Choose verified deals",
    description:
      "Look for verified coupons to find offers that are more likely to work.",
  },
  {
    icon: Copy,
    title: "Apply your coupon",
    description:
      "Copy the coupon code and enter it at checkout when shopping.",
  },
  {
    icon: ShoppingBag,
    title: "Enjoy your savings",
    description:
      "Compare available offers and get more value from every purchase.",
  },
];

export default function CategorySidebar() {
  return (
    <aside className="space-y-5">
      {/* Money-saving guide */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        <div className="relative overflow-hidden bg-[var(--brand-navy)] p-5">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--brand-purple)]/30 blur-2xl" />

          <div className="relative">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-yellow)] text-[var(--brand-navy)]">
              <Lightbulb size={22} />
            </div>

            <h2 className="text-xl font-extrabold leading-snug text-white">
              How to Save More with
              <span className="text-[var(--brand-yellow)]">
                {" "}CouponsNext
              </span>
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/65">
              A few smart shopping habits can help you make the most of every
              purchase.
            </p>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {savingSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="flex gap-3">
                <div className="relative flex shrink-0 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-light)] text-[var(--brand-purple)]">
                    <Icon size={19} />
                  </div>

                  {index !== savingSteps.length - 1 && (
                    <div className="mt-2 h-5 w-px bg-[var(--border)]" />
                  )}
                </div>

                <div className="min-w-0 pt-0.5">
                  <h3 className="text-sm font-bold text-[var(--brand-navy)]">
                    {step.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explore deals CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--brand-purple)]/15 bg-[var(--accent-light)] p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--brand-purple)]/10 blur-2xl" />

        <div className="relative">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[var(--brand-purple)] shadow-sm">
            <Sparkles size={20} />
          </div>

          <h3 className="text-lg font-extrabold text-[var(--brand-navy)]">
            Ready to find a great deal?
          </h3>

          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Explore the latest coupons and exclusive offers from popular
            stores.
          </p>

          <Link
            href="/coupons"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--brand-purple)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--accent-hover)]"
          >
            Explore Coupons
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Small reminder */}
      <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-white p-4">
        <Tag
          size={19}
          className="mt-0.5 shrink-0 text-[var(--brand-purple)]"
        />

        <p className="text-xs leading-5 text-[var(--muted)]">
          Always check the offer details, expiry date, and terms before
          completing your purchase.
        </p>
      </div>
    </aside>
  );
}
