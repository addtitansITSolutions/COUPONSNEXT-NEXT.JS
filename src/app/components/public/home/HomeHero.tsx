import HomeBannerSlider from "./HomeBannerSlider";
import PopularPartners from "./PopularPartners";

export default function HomeHero() {
  return (
    <section
      className="relative isolate overflow-hidden py-6 sm:py-8 md:py-10"
      style={{ backgroundColor: "var(--brand-yellow)" }}
    >
      {/* Background Decorative Glow Blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full blur-3xl sm:-right-40 sm:-top-40 sm:h-[420px] sm:w-[420px]"
        style={{ backgroundColor: "var(--brand-purple)", opacity: 0.28 }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl sm:-bottom-52 sm:left-[25%] sm:h-[380px] sm:w-[380px] sm:translate-x-0"
        style={{ backgroundColor: "var(--brand-yellow)", opacity: 0.08 }}
      />

      <div className="relative mx-auto flex max-w-7xl items-stretch gap-5 px-4 sm:px-6 lg:px-8">
        <PopularPartners />

        <div className="min-h-0 min-w-0 flex-1 self-stretch">
          <HomeBannerSlider />
        </div>
      </div>
    </section>
  );
}