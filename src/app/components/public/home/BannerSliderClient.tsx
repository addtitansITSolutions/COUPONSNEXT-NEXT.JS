// "use client";
// import { useCallback, useEffect, useState } from "react";
// import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

// export interface HomeBanner {
//   id: string;
//   title: string;
//   subtitle?: string;
//   desktopImage: string;
//   mobileImage: string;
//   affiliateUrl: string;
//   storeName: string;
// }

// interface BannerSliderClientProps {
//   banners: HomeBanner[];
// }

// export default function BannerSliderClient({
//   banners,
// }: BannerSliderClientProps) {
//   const [activeIndex, setActiveIndex] = useState(0);

//   const goTo = useCallback(
//     (index: number) => {
//       setActiveIndex((index + banners.length) % banners.length);
//     },
//     [banners.length],
//   );

//   useEffect(() => {
//     if (banners.length <= 1) return;

//     const interval = window.setInterval(() => {
//       setActiveIndex((current) => (current + 1) % banners.length);
//     }, 5000);

//     return () => window.clearInterval(interval);
//   }, [banners.length]);

//   if (banners.length === 0) return null;

//   const banner = banners[activeIndex];

//   return (
//     <>
//     <section
//       aria-label="Featured store promotions"
//       className="relative w-full min-w-0"
//     >
//       <div className="relative isolate aspect-square w-full overflow-hidden rounded-none bg-[var(--brand-navy)] sm:aspect-[16/7] sm:rounded-3xl lg:aspect-[16/8]"
//       >
//         {/* Images */}
//         {banners.map((item, index) => (
//           <div
//             key={item.id}
//             aria-hidden={index !== activeIndex}
//             className={`absolute inset-0 transition-opacity duration-700 ${
//               index === activeIndex
//                 ? "z-10 opacity-100"
//                 : "z-0 opacity-0"
//             }`}
//           >
//             <picture>
//               <source
//                 media="(max-width: 639px)"
//                 srcSet={item.mobileImage}
//               />
//               <img
//                 src={item.desktopImage}
//                 alt={item.title}
//                 className="h-full w-full object-cover"
//                 loading={index === 0 ? "eager" : "lazy"}
//                 fetchPriority={index === 0 ? "high" : "auto"}
//               />
//             </picture>
//           </div>
//         ))}

//         {/* Dark bottom overlay for readable text */}
//         <div
//           aria-hidden="true"
//           className="pointer-events-none absolute inset-0 z-10"
//           style={{
//             background:
//               "linear-gradient(to top, rgba(8, 12, 22, 0.96) 0%, rgba(8, 12, 22, 0.72) 28%, rgba(8, 12, 22, 0.12) 68%, rgba(8, 12, 22, 0.04) 100%)",
//           }}
//         />

//         {/* Banner text and CTA */}
//         <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white sm:p-7 lg:p-9">
//           <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-yellow)] sm:text-xs">
//             Featured offer
//             {banner.storeName ? ` · ${banner.storeName}` : ""}
//           </p>

//           <h2 className="max-w-2xl font-heading text-2xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
//             {banner.title}
//           </h2>

//           {banner.subtitle && (
//             <p className="mt-2 line-clamp-2 max-w-xl text-xs leading-5 text-white/80 sm:mt-3 sm:text-sm sm:leading-6">
//               {banner.subtitle}
//             </p>
//           )}

//           <a
//             href={banner.affiliateUrl}
//             target="_blank"
//             rel="noopener noreferrer sponsored"
//             className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition hover:opacity-90 sm:mt-5 sm:min-h-11 sm:px-5 sm:text-sm"
//             style={{ backgroundColor: "var(--brand-purple)" }}
//           >
//             Visit Store
//             <ExternalLink size={15} />
//           </a>
//         </div>

//         {/* Previous / next arrows */}
//         {banners.length > 1 && (
//           <>
//             <button
//               type="button"
//               onClick={() => goTo(activeIndex - 1)}
//               aria-label="Previous banner"
//               className="absolute left-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur transition hover:bg-black/60 sm:left-5 sm:h-11 sm:w-11"
//             >
//               <ArrowLeft size={18} />
//             </button>

//             <button
//               type="button"
//               onClick={() => goTo(activeIndex + 1)}
//               aria-label="Next banner"
//               className="absolute right-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur transition hover:bg-black/60 sm:right-5 sm:h-11 sm:w-11"
//             >
//               <ArrowRight size={18} />
//             </button>
//           </>
//         )}

//         {/* Slide indicators */}
//         {banners.length > 1 && (
//           <div className="absolute bottom-4 right-5 z-30 flex items-center gap-1.5 sm:bottom-6 sm:right-8">
//             {banners.map((item, index) => (
//               <button
//                 key={item.id}
//                 type="button"
//                 onClick={() => goTo(index)}
//                 aria-label={`Go to banner ${index + 1}`}
//                 aria-current={index === activeIndex ? "true" : undefined}
//                 className={`h-1.5 rounded-full transition-all duration-300 ${
//                   index === activeIndex
//                     ? "w-7 bg-[var(--brand-yellow)]"
//                     : "w-1.5 bg-white/60 hover:bg-white"
//                 }`}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </section>
//     </>
//   );
// }





"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HomeBanner {
  id: string;
  title: string;
  subtitle?: string;
  desktopImage: string;
  mobileImage: string;
  affiliateUrl: string;
  storeName: string;
}

interface BannerSliderClientProps {
  banners: HomeBanner[];
}

export default function BannerSliderClient({
  banners,
}: BannerSliderClientProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isHovered, setIsHovered] = useState(false);

  const activeIndex = (page % banners.length + banners.length) % banners.length;

  const paginate = useCallback((newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setPage(([prevPage]) => {
        const currentActive =
          (prevPage % banners.length + banners.length) % banners.length;
        const diff = index - currentActive;
        return [prevPage + diff, diff >= 0 ? 1 : -1];
      });
    },
    [banners.length],
  );

  useEffect(() => {
    if (banners.length <= 1 || isHovered) return;

    const interval = window.setInterval(() => {
      paginate(1);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [banners.length, isHovered, paginate]);

  if (!banners || banners.length === 0) return null;

  const banner = banners[activeIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  // Dynamic window offset calculation for centered sliding dots
  const MAX_VISIBLE_DOTS = 15;
  const dotWidth = 20; // base slot width including gaps (px)
  let translateX = 0;

  if (banners.length > MAX_VISIBLE_DOTS) {
    const minOffset = 0;
    const maxOffset = (banners.length - MAX_VISIBLE_DOTS) * dotWidth;
    const targetOffset = (activeIndex - Math.floor(MAX_VISIBLE_DOTS / 2)) * dotWidth;
    translateX = Math.max(minOffset, Math.min(targetOffset, maxOffset));
  }

  return (
    <section
      aria-label="Featured store promotions"
      className="relative flex w-full min-w-0 flex-col gap-3 sm:gap-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* CARD FRAME */}
      <div className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--brand-navy)] shadow-2xl shadow-black/40 sm:aspect-[16/7] sm:rounded-3xl lg:aspect-[21/9]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={page}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 280, damping: 32 },
              opacity: { duration: 0.35 },
            }}
            drag={banners.length > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -10000 || offset.x < -100) {
                paginate(1);
              } else if (swipe > 10000 || offset.x > 100) {
                paginate(-1);
              }
            }}
            className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
          >
            <picture>
              <source
                media="(max-width: 639px)"
                srcSet={banner.mobileImage}
              />
              <img
                src={banner.desktopImage}
                alt={banner.title}
                className="h-full w-full select-none object-cover pointer-events-none"
                loading={activeIndex === 0 ? "eager" : "lazy"}
              />
            </picture>

            {/* Gradient Overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background:
                  "linear-gradient(to top, rgba(8, 12, 22, 0.95) 0%, rgba(8, 12, 22, 0.6) 35%, transparent 100%)",
              }}
            />

            {/* Banner Content */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-5 text-white sm:p-7 lg:p-10">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-yellow)] sm:text-xs">
                Featured offer
                {banner.storeName ? ` · ${banner.storeName}` : ""}
              </p>

              <h2 className="max-w-3xl font-heading text-xl font-extrabold leading-tight sm:text-3xl lg:text-4xl">
                {banner.title}
              </h2>

              {banner.subtitle && (
                <p className="mt-1.5 line-clamp-2 max-w-xl text-xs leading-5 text-white/80 sm:mt-2.5 sm:text-sm sm:leading-6">
                  {banner.subtitle}
                </p>
              )}

              <a
                href={banner.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-3.5 inline-flex min-h-9 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 sm:mt-5 sm:min-h-11 sm:px-5 sm:text-sm"
                style={{ backgroundColor: "var(--brand-purple)" }}
              >
                Visit Store
                <ExternalLink size={15} />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows inside Card */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => paginate(-1)}
              aria-label="Previous banner"
              className="absolute left-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70 sm:left-5 sm:h-11 sm:w-11"
            >
              <ArrowLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => paginate(1)}
              aria-label="Next banner"
              className="absolute right-3 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-black/70 sm:right-5 sm:h-11 sm:w-11"
            >
              <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* DYNAMIC SCROLLING DOTS CONTAINER */}
      {banners.length > 1 && (
        <div className="flex w-full justify-center pt-1">
          <div
            className="relative flex items-center overflow-hidden py-1"
            style={{
              width: `${Math.min(banners.length, MAX_VISIBLE_DOTS) * dotWidth + 12}px`,
            }}
          >
            <motion.div
              animate={{ x: -translateX }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="flex items-center gap-2 px-1.5"
            >
              {banners.map((item, index) => {
                const isActive = index === activeIndex;
                const distance = Math.abs(index - activeIndex);

                // Dynamically scale edge dots when there are many banners
                let scale = 1;
                if (banners.length > MAX_VISIBLE_DOTS) {
                  if (distance === 2) scale = 0.75;
                  if (distance >= 3) scale = 0.5;
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(index)}
                    aria-label={`Go to banner ${index + 1}`}
                    aria-current={isActive ? "true" : undefined}
                    className="group relative flex h-6 shrink-0 items-center justify-center focus:outline-none"
                    style={{ width: "12px" }}
                  >
                    <motion.span
                      layout
                      animate={{ scale }}
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      className={`block h-2 rounded-full transition-colors duration-200 ${
                        isActive
                          ? "w-6 bg-[var(--brand-purple)]"
                          : "w-2 bg-white/70 hover:bg-white group-hover:bg-white"
                      }`}
                    />
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>
      )}
    </section>
  );
}