
// "use client";

// import { useRef } from "react";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   ArrowRight,
//   ArrowUpRight,
//   Store,
//   Tag,
// } from "lucide-react";
// import { motion, useReducedMotion } from "framer-motion";

// const featuredStores = [
//   {
//     id: "amazon",
//     name: "Amazon",
//     category: "Electronics & More",
//     offers: 24,
//     initials: "a",
//     background: "#ffffff",
//     color: "#232f3e",
//     accent: "#ff9900",
//   },
//   {
//     id: "nike",
//     name: "Nike",
//     category: "Fashion & Sports",
//     offers: 18,
//     initials: "N",
//     background: "#111111",
//     color: "#ffffff",
//     accent: "#ffffff",
//   },
//   {
//     id: "adidas",
//     name: "Adidas",
//     category: "Sportswear",
//     offers: 16,
//     initials: "ad",
//     background: "#111111",
//     color: "#ffffff",
//     accent: "#ffffff",
//   },
//   {
//     id: "myntra",
//     name: "Myntra",
//     category: "Fashion & Lifestyle",
//     offers: 21,
//     initials: "M",
//     background: "#fff0f4",
//     color: "#ff3f6c",
//     accent: "#ff3f6c",
//   },
//   {
//     id: "flipkart",
//     name: "Flipkart",
//     category: "Shopping & Lifestyle",
//     offers: 32,
//     initials: "f",
//     background: "#edf5ff",
//     color: "#2874f0",
//     accent: "#ffcc00",
//   },
//   {
//     id: "puma",
//     name: "PUMA",
//     category: "Fashion & Sports",
//     offers: 12,
//     initials: "P",
//     background: "#f4f4f4",
//     color: "#181818",
//     accent: "#181818",
//   },
//   {
//     id: "apple",
//     name: "Apple",
//     category: "Technology",
//     offers: 9,
//     initials: "A",
//     background: "#f1f2f4",
//     color: "#222222",
//     accent: "#777777",
//   },
//   {
//     id: "samsung",
//     name: "Samsung",
//     category: "Electronics",
//     offers: 15,
//     initials: "S",
//     background: "#edf4ff",
//     color: "#1428a0",
//     accent: "#1428a0",
//   },
// ];

// const sectionVariants = {
//   hidden: { opacity: 0, y: 28 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.65,
//       ease: "easeOut" as const,
//       staggerChildren: 0.09,
//     },
//   },
// };

// const cardVariants = {
//   hidden: { opacity: 0, y: 24 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.45,
//       ease: "easeOut" as const,
//     },
//   },
// };

// export default function FeaturedStores() {
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const prefersReducedMotion = useReducedMotion();

//   const scrollStores = (direction: "left" | "right") => {
//     if (!scrollRef.current) return;

//     scrollRef.current.scrollBy({
//       left:
//         direction === "right"
//           ? scrollRef.current.clientWidth * 0.8
//           : -scrollRef.current.clientWidth * 0.8,
//       behavior: prefersReducedMotion ? "auto" : "smooth",
//     });
//   };

//   return (
//     <section
//       aria-labelledby="featured-stores-heading"
//       className="relative overflow-hidden bg-[var(--accent-light)] py-14 sm:py-16 lg:py-20"
//     >
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <motion.div
//           variants={sectionVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, amount: 0.15 }}
//         >
//           {/* Section heading */}
//           <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
//             <motion.div variants={cardVariants} className="min-w-0">
//               <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent-light)] px-3 py-1.5">
//                 <Store
//                   size={14}
//                   style={{ color: "var(--brand-purple)" }}
//                 />
//                 <span
//                   className="text-xs font-bold"
//                   style={{ color: "var(--brand-purple)" }}
//                 >
//                   Popular destinations
//                 </span>
//               </div>

//               <h2
//                 id="featured-stores-heading"
//                 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl"
//                 style={{ color: "var(--brand-navy)" }}
//               >
//                 Featured{" "}
//                 <span style={{ color: "var(--brand-purple)" }}>
//                   Stores
//                 </span>
//               </h2>

//               <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base">
//                 Your favourite brands, all in one place. Find deals and save
//                 more on every purchase.
//               </p>
//             </motion.div>

//             {/* Desktop navigation */}
//             <motion.div
//               variants={cardVariants}
//               className="hidden shrink-0 items-center gap-3 sm:flex"
//             >
//               <button
//                 type="button"
//                 onClick={() => scrollStores("left")}
//                 aria-label="Scroll stores left"
//                 className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] bg-white text-[var(--brand-navy)] transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] hover:text-[var(--brand-purple)]"
//               >
//                 <ArrowLeft size={18} />
//               </button>

//               <button
//                 type="button"
//                 onClick={() => scrollStores("right")}
//                 aria-label="Scroll stores right"
//                 className="flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:opacity-90"
//                 style={{ backgroundColor: "var(--brand-purple)" }}
//               >
//                 <ArrowRight size={18} />
//               </button>
//             </motion.div>
//           </div>

//           {/* Horizontal store carousel */}
//           <div
//             ref={scrollRef}
//             className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
//           >
//             {featuredStores.map((store, index) => (
//               <motion.div
//                 key={store.id}
//                 variants={cardVariants}
//                 className="w-[68%] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
//               >
//                 <Link
//                   href={`/stores/${store.id}`}
//                   className="group relative flex h-full min-h-[224px] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-4 transition-colors duration-300 hover:border-[var(--brand-purple)] sm:min-h-[246px] sm:p-5"
//                   aria-label={`View ${store.name} coupons and deals`}
//                 >
//                   {/* Subtle hover accent */}
//                   <motion.div
//                     aria-hidden="true"
//                     className="absolute inset-x-0 top-0 h-1 origin-left"
//                     style={{ backgroundColor: "var(--brand-purple)" }}
//                     initial={{ scaleX: 0 }}
//                     whileHover={{ scaleX: 1 }}
//                     transition={{ duration: 0.25 }}
//                   />

//                   <div className="flex items-start justify-between gap-2">
//                     {/* Dummy logo placeholder */}
//                     <div
//                       className="flex h-[68px] w-[68px] items-center justify-center overflow-hidden rounded-2xl border border-black/5 text-3xl font-extrabold sm:h-[76px] sm:w-[76px] sm:text-4xl"
//                       style={{
//                         backgroundColor: store.background,
//                         color: store.color,
//                       }}
//                     >
//                       <span>{store.initials}</span>
//                     </div>

//                     <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-[var(--accent-light)] group-hover:text-[var(--brand-purple)]">
//                       <ArrowUpRight
//                         size={17}
//                         className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
//                       />
//                     </span>
//                   </div>

//                   <div className="mt-5">
//                     <h3
//                       className="font-heading text-lg font-bold tracking-tight sm:text-xl"
//                       style={{ color: "var(--brand-navy)" }}
//                     >
//                       {store.name}
//                     </h3>

//                     <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
//                       {store.category}
//                     </p>
//                   </div>

//                   <div className="mt-auto flex items-center justify-between gap-2 pt-5">
//                     <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-purple)] sm:text-sm">
//                       <Tag size={14} />
//                       {store.offers} offers
//                     </span>

//                     <span
//                       className="h-2 w-2 rounded-full"
//                       style={{ backgroundColor: store.accent }}
//                       aria-hidden="true"
//                     />
//                   </div>
//                 </Link>
//               </motion.div>
//             ))}
//           </div>

//           {/* Mobile scroll hint */}
//           <div className="mt-1 flex items-center justify-between sm:hidden">
//             <p className="text-xs text-[var(--muted)]">
//               Swipe to explore stores
//             </p>

//             <div className="flex items-center gap-1.5">
//               <span className="h-1.5 w-5 rounded-full bg-[var(--brand-purple)]" />
//               <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
//               <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
//             </div>
//           </div>

//           {/* View all */}
//           <motion.div
//             variants={cardVariants}
//             className="mt-7 flex justify-center sm:mt-9"
//           >
//             <Link
//               href="/stores"
//               className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-bold transition hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)]"
//               style={{ color: "var(--brand-purple)" }}
//             >
//               Explore all stores
//               <ArrowRight size={16} />
//             </Link>
//           </motion.div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }





"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Store,
  Tag,
} from "lucide-react";
import { motion, useReducedMotion, Variants } from "framer-motion";

const featuredStores = [
  {
    id: "amazon",
    name: "Amazon",
    category: "Electronics & More",
    offers: 24,
    initials: "a",
    background: "#ffffff",
    color: "#232f3e",
    accent: "#ff9900",
  },
  {
    id: "nike",
    name: "Nike",
    category: "Fashion & Sports",
    offers: 18,
    initials: "N",
    background: "#111111",
    color: "#ffffff",
    accent: "#ffffff",
  },
  {
    id: "adidas",
    name: "Adidas",
    category: "Sportswear",
    offers: 16,
    initials: "ad",
    background: "#111111",
    color: "#ffffff",
    accent: "#ffffff",
  },
  {
    id: "myntra",
    name: "Myntra",
    category: "Fashion & Lifestyle",
    offers: 21,
    initials: "M",
    background: "#fff0f4",
    color: "#ff3f6c",
    accent: "#ff3f6c",
  },
  {
    id: "flipkart",
    name: "Flipkart",
    category: "Shopping & Lifestyle",
    offers: 32,
    initials: "f",
    background: "#edf5ff",
    color: "#2874f0",
    accent: "#ffcc00",
  },
  {
    id: "puma",
    name: "PUMA",
    category: "Fashion & Sports",
    offers: 12,
    initials: "P",
    background: "#f4f4f4",
    color: "#181818",
    accent: "#181818",
  },
  {
    id: "apple",
    name: "Apple",
    category: "Technology",
    offers: 9,
    initials: "A",
    background: "#f1f2f4",
    color: "#222222",
    accent: "#777777",
  },
  {
    id: "samsung",
    name: "Samsung",
    category: "Electronics",
    offers: 15,
    initials: "S",
    background: "#edf4ff",
    color: "#1428a0",
    accent: "#1428a0",
  },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.215, 0.61, 0.355, 1],
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function FeaturedStores() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const scrollStores = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left:
        direction === "right"
          ? scrollRef.current.clientWidth * 0.85
          : -scrollRef.current.clientWidth * 0.85,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      aria-labelledby="featured-stores-heading"
      className="relative overflow-hidden bg-[var(--accent-light)] py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Section Heading & Navigation */}
          <div className="mb-6 flex items-center justify-between gap-4 sm:mb-8">
                <motion.div variants={cardVariants} className="min-w-0">
                    {/* Bold App-Style Heading with Solid Color & Clean Accent Bar */}
                    <h2
                    id="featured-stores-heading"
                    className="font-heading text-3xl font-black tracking-tight text-[var(--brand-purple)] sm:text-4xl lg:text-5xl"
                    >
                    FEATURED{" "}
                    <span className="relative inline-block text-[var(--brand-yellow)]">
                        STORES
                        {/* Sleek solid underline accent */}
                        <span
                        aria-hidden="true"
                        className="absolute -bottom-2 left-0 h-1.5 w-full rounded-full bg-[var(--brand-purple)]"
                        />
                    </span>
                    </h2>
                </motion.div>

                {/* Compact Navigation Controls */}
                <motion.div
                    variants={cardVariants}
                    className="flex shrink-0 items-center gap-2 sm:gap-3"
                >
                    <button
                    type="button"
                    onClick={() => scrollStores("left")}
                    aria-label="Scroll stores left"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--border)] bg-white/80 text-[var(--brand-navy)] shadow-sm backdrop-blur-md transition hover:border-[var(--brand-purple)] hover:text-[var(--brand-purple)] active:scale-90 sm:h-11 sm:w-11"
                    >
                    <ArrowLeft size={18} />
                    </button>

                    <button
                    type="button"
                    onClick={() => scrollStores("right")}
                    aria-label="Scroll stores right"
                    className="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md transition hover:opacity-95 active:scale-90 sm:h-11 sm:w-11"
                    style={{ backgroundColor: "var(--brand-purple)" }}
                    >
                    <ArrowRight size={18} />
                    </button>
                </motion.div>
            </div>

          {/* Horizontal Store Carousel */}
          <div
            ref={scrollRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
          >
            {featuredStores.map((store) => (
              <motion.div
                key={store.id}
                variants={cardVariants}
                whileHover={prefersReducedMotion ? {} : { y: -6 }}
                transition={{ duration: 0.2 }}
                className="w-[72%] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <Link
                  href={`/stores/${store.id}`}
                  className="group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-[var(--brand-yellow)] bg-[var(--brand-purple)]/75 p-4 shadow-sm transition-all duration-300 hover:border-[var(--brand-yellow)] hover:shadow-xl hover:shadow-yellow-900/5 sm:min-h-[240px]"
                  aria-label={`View ${store.name} coupons and deals`}
                >

                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-27 w-27 transition-opacity duration-300 rounded-br-xl z-10 opacity-85"
                    style={{ backgroundColor: "var(--brand-yellow)" }}
                />


                  {/* Subtle top indicator bar */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-1 transition-opacity duration-300 opacity-40 group-hover:opacity-100"
                    style={{ backgroundColor: "var(--brand-yellow)" }}
                  />

                  <div className="flex items-start justify-between gap-2 z-99 mb-2">
                    {/* Store Logo Placeholder */}
                    <div
                      className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-2xl border border-black/5 text-2xl font-extrabold shadow-inner sm:h-[72px] sm:w-[72px] sm:text-3xl"
                      style={{
                        backgroundColor: store.background,
                        color: store.color,
                      }}
                    >
                      <span>{store.initials}</span>
                    </div>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition group-hover:bg-[var(--accent-light)] group-hover:text-[var(--brand-yellow)]">
                      <ArrowUpRight
                        size={17}
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3
                      className="font-heading text-lg font-bold tracking-tight sm:text-xl"
                      style={{ color: "var(--brand-white)" }}
                    >
                      {store.name}
                    </h3>

                    <p className="mt-0.5 text-xs font-medium text-[var(--accent-light)] sm:text-sm">
                      {store.category}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--brand-yellow)] sm:text-sm">
                      <Tag size={14} className="shrink-0" />
                      {store.offers} offers
                    </span>

                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: store.accent }}
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mobile Scroll Hint */}
          <div className="mt-2 flex items-center justify-between sm:hidden px-1">
            <p className="text-xs font-medium text-[var(--muted)]">
              Swipe to explore stores
            </p>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-4 rounded-full bg-[var(--brand-purple)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            </div>
          </div>

          {/* View All Button */}
          <motion.div
            variants={cardVariants}
            className="mt-8 flex justify-center sm:mt-10"
          >
            <Link
              href="/stores"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-6 py-3 text-sm font-bold shadow-sm transition-all duration-200 hover:border-[var(--brand-purple)] hover:bg-[var(--accent-light)] active:scale-95"
              style={{ color: "var(--brand-purple)" }}
            >
              Explore all stores
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
