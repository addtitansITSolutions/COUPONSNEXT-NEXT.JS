
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

const footerGroups = [
  {
    title: "Discover",
    links: [
      { label: "All stores", href: "/stores" },
      { label: "Coupons & deals", href: "/coupons" },
      { label: "Categories", href: "/category" },
      { label: "Our blog", href: "/blog" },
    ],
  },
  {
    title: "CouponsNext",
    links: [
      { label: "About us", href: "/about" },
      { label: "Contact us", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
];

export default function PublicFooter() {
  return (
    <footer
      style={{
        backgroundColor: "var(--brand-navy)",
        color: "var(--brand-white)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="font-heading text-2xl font-extrabold tracking-tight"
            >
              <span style={{ color: "var(--brand-white)" }}>Coupons</span>
              <span style={{ color: "var(--brand-yellow)" }}>Next</span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
              Your smarter way to save. Discover coupons, explore deals, and
              find offers from stores you love.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                <ShieldCheck size={15} style={{ color: "var(--brand-yellow)" }} />
                Handpicked offers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                <Sparkles size={15} style={{ color: "var(--brand-yellow)" }} />
                Fresh savings
              </span>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold">{group.title}</h2>
              <ul className="mt-5 space-y-4">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-white"
                    >
                      {link.label}
                      <ArrowRight
                        size={13}
                        className="opacity-0 transition group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} CouponsNext. All rights reserved.
          </p>
          <p>Offers are subject to each store&apos;s terms and conditions.</p>
        </div>
      </div>
    </footer>
  );
}
