
import {
  Search,
  Menu,
  ArrowRight,
  ChevronRight,
  Tag,
  ShieldCheck,
  Zap,
  Gift,
} from "lucide-react";

const stores = [
  { name: "Nike", category: "Fashion", initials: "N" },
  { name: "Amazon", category: "Shopping", initials: "a" },
  { name: "Adidas", category: "Fashion", initials: "ad" },
  { name: "Myntra", category: "Fashion", initials: "M" },
  { name: "Samsung", category: "Electronics", initials: "S" },
  { name: "Flipkart", category: "Shopping", initials: "F" },
];

const coupons = [
  {
    store: "Nike",
    title: "Extra 20% off on selected styles",
    description:
      "Get an additional discount on selected footwear and apparel.",
    code: "NIKE20",
    type: "code",
    label: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
  {
    store: "Amazon",
    title: "Save on your next purchase",
    description:
      "Explore current offers on electronics and everyday essentials.",
    code: "",
    type: "deal",
    label: "SPECIAL DEAL",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
  },
  {
    store: "Adidas",
    title: "Save on selected sportswear",
    description:
      "Discover discounts on selected shoes and sportswear.",
    code: "SPORT15",
    type: "code",
    label: "15% OFF",
    image:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600",
  },
];

const categories = [
  "Fashion",
  "Electronics",
  "Beauty",
  "Travel",
  "Food & Dining",
  "Home & Living",
];

function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{
        backgroundColor: "var(--background)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <a href="/" className="flex items-center gap-1">
          <span
            className="font-heading text-2xl font-extrabold tracking-tight"
            style={{ color: "var(--brand-purple)" }}
          >
            Coupons
            <span style={{ color: "var(--brand-yellow)" }}>Next</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="/"
            className="text-sm font-semibold"
            style={{ color: "var(--brand-purple)" }}
          >
            Home
          </a>
          {[
            { label: "Stores", href: "#stores" },
            { label: "Coupons", href: "#coupons" },
            { label: "Categories", href: "#categories" },
            { label: "Blog", href: "/blog" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-[var(--brand-purple)]"
              style={{ color: "var(--muted)" }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="#search"
            className="hidden items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] sm:flex"
            style={{
              borderColor: "var(--border)",
              color: "var(--muted)",
            }}
          >
            <Search size={16} />
            Search
          </a>

          <button
            type="button"
            aria-label="Open menu"
            className="rounded-lg border p-2 md:hidden"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--brand-navy)" }}
    >
      <div
        className="absolute -right-32 -top-40 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: "var(--brand-purple)",
          opacity: 0.25,
        }}
      />
      <div
        className="absolute -bottom-48 -left-20 h-96 w-96 rounded-full blur-3xl"
        style={{
          backgroundColor: "var(--brand-yellow)",
          opacity: 0.08,
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
        <div>
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
            style={{
              borderColor: "rgba(255,255,255,0.15)",
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "var(--brand-yellow)",
            }}
          >
            <Zap size={15} />
            Your everyday savings start here
          </div>

          <h1
            className="max-w-xl font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: "var(--brand-white)" }}
          >
            Find deals.
            <br />
            Save more.
            <br />
            <span style={{ color: "var(--brand-yellow)" }}>
              Shop smarter.
            </span>
          </h1>

          <p
            className="mt-6 max-w-lg text-base leading-7"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            Discover verified promo codes, exclusive offers and deals from
            stores you love.
          </p>

          <form
            action="/search"
            id="search"
            className="mt-9 flex max-w-xl items-center rounded-xl p-2 shadow-xl"
            style={{ backgroundColor: "var(--background)" }}
          >
            <Search
              className="ml-3 shrink-0"
              size={21}
              style={{ color: "var(--muted)" }}
            />
            <input
              type="search"
              name="q"
              placeholder="Search stores, coupons and deals..."
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            <button
              type="submit"
              className="rounded-lg px-5 py-3 text-sm font-bold transition-colors hover:bg-[var(--accent-hover)]"
              style={{
                backgroundColor: "var(--brand-purple)",
                color: "var(--brand-white)",
              }}
            >
              Search
            </button>
          </form>

          <div
            className="mt-6 flex flex-wrap gap-5 text-xs"
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck
                size={16}
                style={{ color: "var(--brand-yellow)" }}
              />
              Handpicked offers
            </span>
            <span className="flex items-center gap-2">
              <Tag size={16} style={{ color: "var(--brand-yellow)" }} />
              Daily deals
            </span>
          </div>
        </div>

        <div className="hidden justify-end md:flex">
          <div className="relative w-full max-w-md">
            <div
              className="absolute -inset-5 rounded-3xl blur-2xl"
              style={{
                backgroundColor: "var(--brand-purple)",
                opacity: 0.2,
              }}
            />
            <div
              className="relative rounded-3xl border p-5 shadow-2xl backdrop-blur"
              style={{
                borderColor: "rgba(255,255,255,0.1)",
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    Today's highlights
                  </p>
                  <h2
                    className="mt-1 text-xl font-bold"
                    style={{ color: "var(--brand-white)" }}
                  >
                    Deals worth finding
                  </h2>
                </div>
                <Gift
                  size={28}
                  style={{ color: "var(--brand-yellow)" }}
                />
              </div>

              <div className="space-y-3">
                <div
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-black"
                    style={{
                      backgroundColor: "var(--brand-navy)",
                      color: "var(--brand-white)",
                    }}
                  >
                    N
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      Nike
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Selected styles
                    </p>
                  </div>
                  <span
                    className="rounded-lg px-3 py-2 text-sm font-bold"
                    style={{
                      backgroundColor: "var(--accent-light)",
                      color: "var(--brand-purple)",
                    }}
                  >
                    20% OFF
                  </span>
                </div>

                <div
                  className="flex items-center gap-4 rounded-2xl p-4"
                  style={{ backgroundColor: "var(--background)" }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl font-black"
                    style={{
                      backgroundColor: "var(--brand-yellow)",
                      color: "var(--brand-navy)",
                    }}
                  >
                    a
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="font-bold"
                      style={{ color: "var(--foreground)" }}
                    >
                      Amazon
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      Special offers
                    </p>
                  </div>
                  <span
                    className="rounded-lg px-3 py-2 text-sm font-bold"
                    style={{
                      backgroundColor: "var(--accent-light)",
                      color: "var(--brand-purple)",
                    }}
                  >
                    DEALS
                  </span>
                </div>

                <div
                  className="rounded-2xl border border-dashed p-4 text-center text-sm"
                  style={{
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  New offers added regularly
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StoreSection() {
  return (
    <section
      id="stores"
      className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p
            className="text-sm font-bold uppercase tracking-wider"
            style={{ color: "var(--brand-purple)" }}
          >
            Explore stores
          </p>
          <h2
            className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl"
            style={{ color: "var(--foreground)" }}
          >
            Popular stores
          </h2>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Find offers from brands you know.
          </p>
        </div>
        <a
          href="/stores"
          className="hidden items-center gap-1 text-sm font-bold transition-colors hover:text-[var(--accent-hover)] sm:flex"
          style={{ color: "var(--brand-purple)" }}
        >
          View all <ArrowRight size={16} />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {stores.map((store) => (
          <a
            key={store.name}
            href={`/store/${store.name.toLowerCase()}`}
            className="group rounded-2xl border p-4 text-center transition-all hover:-translate-y-1 hover:shadow-lg hover:border-[var(--brand-purple)]"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
            }}
          >
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-extrabold"
              style={{
                backgroundColor: "var(--brand-navy)",
                color: "var(--brand-yellow)",
              }}
            >
              {store.initials}
            </div>
            <h3
              className="mt-3 text-sm font-bold"
              style={{ color: "var(--foreground)" }}
            >
              {store.name}
            </h3>
            <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
              {store.category}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

function CouponSection() {
  return (
    <section
      id="coupons"
      className="py-16"
      style={{ backgroundColor: "var(--accent-light)" }}
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p
              className="text-sm font-bold uppercase tracking-wider"
              style={{ color: "var(--brand-purple)" }}
            >
              Fresh savings
            </p>
            <h2
              className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl"
              style={{ color: "var(--foreground)" }}
            >
              Latest coupons & deals
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              Explore offers selected for you.
            </p>
          </div>
          <a
            href="/coupons"
            className="hidden items-center gap-1 text-sm font-bold transition-colors hover:text-[var(--accent-hover)] sm:flex"
            style={{ color: "var(--brand-purple)" }}
          >
            View all <ArrowRight size={16} />
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {coupons.map((coupon) => (
            <article
              key={coupon.title}
              className="overflow-hidden rounded-2xl border shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <div
                className="relative h-48 overflow-hidden"
                style={{ backgroundColor: "var(--accent-light)" }}
              >
                <img
                  src={coupon.image}
                  alt={coupon.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <span
                  className="absolute left-3 top-3 rounded-lg px-3 py-1.5 text-xs font-extrabold"
                  style={{
                    backgroundColor: "var(--brand-yellow)",
                    color: "var(--brand-navy)",
                  }}
                >
                  {coupon.label}
                </span>
              </div>

              <div className="p-5">
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: "var(--muted)" }}
                >
                  {coupon.store}
                </p>
                <h3
                  className="mt-2 min-h-12 font-heading text-lg font-bold leading-6"
                  style={{ color: "var(--foreground)" }}
                >
                  {coupon.title}
                </h3>
                <p
                  className="mt-2 min-h-10 text-sm leading-5"
                  style={{ color: "var(--muted)" }}
                >
                  {coupon.description}
                </p>

                <div
                  className="mt-5 flex items-center justify-between gap-3 border-t pt-4"
                  style={{ borderColor: "var(--border)" }}
                >
                  {coupon.type === "code" ? (
                    <div
                      className="rounded-lg border border-dashed px-3 py-2 text-sm font-bold tracking-wider"
                      style={{
                        borderColor: "var(--brand-purple)",
                        backgroundColor: "var(--accent-light)",
                        color: "var(--brand-purple)",
                      }}
                    >
                      {coupon.code}
                    </div>
                  ) : (
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--brand-purple)" }}
                    >
                      No code needed
                    </span>
                  )}

                  <a
                    href={`/store/${coupon.store.toLowerCase()}`}
                    className="inline-flex items-center gap-1 rounded-lg px-4 py-2.5 text-xs font-bold transition-colors hover:bg-[var(--accent-hover)]"
                    style={{
                      backgroundColor: "var(--brand-purple)",
                      color: "var(--brand-white)",
                    }}
                  >
                    {coupon.type === "code" ? "Copy Code" : "Get Deal"}
                    <ChevronRight size={15} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategorySection() {
  return (
    <section
      id="categories"
      className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
    >
      <div className="mb-8">
        <p
          className="text-sm font-bold uppercase tracking-wider"
          style={{ color: "var(--brand-purple)" }}
        >
          Browse by interest
        </p>
        <h2
          className="mt-2 font-heading text-2xl font-extrabold sm:text-3xl"
          style={{ color: "var(--foreground)" }}
        >
          Explore categories
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {categories.map((category) => (
          <a
            key={category}
            href={`/category/${encodeURIComponent(
              category.toLowerCase().replaceAll(" ", "-")
            )}`}
            className="flex items-center justify-between rounded-xl border p-4 text-sm font-semibold transition-colors hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }}
          >
            {category}
            <ChevronRight size={16} />
          </a>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--brand-navy)",
        color: "var(--brand-white)",
      }}
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <a
            href="/"
            className="font-heading text-2xl font-extrabold"
            style={{ color: "var(--brand-white)" }}
          >
            Coupons
            <span style={{ color: "var(--brand-yellow)" }}>Next</span>
          </a>
          <p
            className="mt-4 max-w-sm text-sm leading-6"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Find deals, discover coupons and shop smarter. Your next great
            saving starts here.
          </p>
        </div>

        <div>
          <h3 className="font-bold">Explore</h3>
          <div
            className="mt-4 space-y-3 text-sm"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            <a href="/stores" className="block transition-opacity hover:opacity-100">
              Stores
            </a>
            <a href="/coupons" className="block transition-opacity hover:opacity-100">
              Coupons
            </a>
            <a href="/category" className="block transition-opacity hover:opacity-100">
              Categories
            </a>
            <a href="/blog" className="block transition-opacity hover:opacity-100">
              Blog
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold">Information</h3>
          <div
            className="mt-4 space-y-3 text-sm"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            <a href="/about" className="block transition-opacity hover:opacity-100">
              About us
            </a>
            <a href="/contact" className="block transition-opacity hover:opacity-100">
              Contact
            </a>
            <a href="/privacy" className="block transition-opacity hover:opacity-100">
              Privacy policy
            </a>
            <a href="/terms" className="block transition-opacity hover:opacity-100">
              Terms & conditions
            </a>
          </div>
        </div>
      </div>

      <div
        className="border-t"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        <div
          className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-5 py-5 text-xs sm:flex-row lg:px-8"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <p>
            © {new Date().getFullYear()} CouponsNext. All rights reserved.
          </p>
          <p>Offers are subject to each store's terms.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StoreSection />
        <CouponSection />
        <CategorySection />
      </main>
      <Footer />
    </>
  );
}