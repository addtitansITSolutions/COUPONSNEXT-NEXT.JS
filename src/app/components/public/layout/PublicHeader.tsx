// import Link from "next/link";

// import CategoryMegaMenu from "./CategoryMegaMenu";
// import HeaderAuthActions from "./HeaderAuthActions";
// import MobileNavigation from "./MobileNavigation";
// import GlobalSearch from "./GlobalSearch";

// const navigation = [
//   { label: "Home", href: "/" },
//   { label: "Stores", href: "/stores" },
//   { label: "Coupons", href: "/coupons" },
//   { label: "Blog", href: "/blogs" },
// ];

// const secondaryNavigation = [
//   { label: "All stores", href: "/stores" },
//   { label: "Latest coupons", href: "/coupons" },
//   { label: "Latest deals", href: "/coupons?type=deal" },
//   { label: "Latest articles", href: "/blogs?sort=latest" },
// ];

// export default function PublicHeader() {
//   return (
//     <header
//       className="sticky top-0 z-[999] border-b"
//       style={{
//         backgroundColor: "var(--background)",
//         borderColor: "var(--border)",
//       }}
//     >
//       {/* Primary header */}
//       <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:gap-5 sm:px-6 lg:px-8">

//         {/* Left: Mobile menu + Logo */}
//         <div className="flex shrink-0 items-center gap-3">

//           <div className="md:hidden">
//             <MobileNavigation />
//           </div>

//           <Link
//             href="/"
//             aria-label="CouponsNext homepage"
//             className="shrink-0 font-heading text-[20px] font-extrabold tracking-tight sm:text-2xl"
//           >
//             <span style={{ color: "var(--brand-purple)" }}>
//               Coupons
//             </span>
//             <span style={{ color: "var(--brand-yellow)" }}>
//               Next
//             </span>
//           </Link>
//         </div>

//         {/* Desktop Search: Large screens */}
//         <div className="hidden max-w-md flex-1 lg:mx-4 lg:block">
//           <GlobalSearch
//             placeholder="Search stores, coupons and deals..."
//           />
//         </div>

//         {/* Main Navigation */}
//         <nav
//           aria-label="Main navigation"
//           className="hidden items-center gap-5 md:flex lg:gap-6"
//         >
//           {navigation.map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               className="whitespace-nowrap text-sm font-medium transition-colors hover:text-[var(--brand-purple)]"
//               style={{
//                 color:
//                   item.href === "/"
//                     ? "var(--brand-purple)"
//                     : "var(--foreground)",
//               }}
//             >
//               {item.label}
//             </Link>
//           ))}
//         </nav>

//         {/* Authentication Actions */}
//         <div className="ml-auto flex shrink-0 items-center justify-end md:ml-0">
//           <HeaderAuthActions />
//         </div>
//       </div>

//       {/* Secondary Navigation */}
//       <div
//         className="hidden border-t md:block"
//         style={{ borderColor: "var(--border)" }}
//       >
//         <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6 lg:px-8">

//           {/* Categories */}
//           <CategoryMegaMenu />

//           {/* Medium screen search */}
//           <div className="mx-auto hidden w-full max-w-[280px] flex-1 md:flex md:items-center lg:hidden">
//             <GlobalSearch placeholder="Search stores, coupons and deals..." />
//           </div>

//           {/* Quick Links */}
//           <nav
//             aria-label="Quick links"
//             className="flex min-w-0 shrink-0 items-center gap-4 lg:gap-6"
//           >
//             {secondaryNavigation.map((item) => (
//               <Link
//                 key={item.label}
//                 href={item.href}
//                 className="shrink-0 whitespace-nowrap text-xs font-medium transition-colors hover:text-[var(--brand-purple)]"
//                 style={{ color: "var(--muted)" }}
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// }







import Link from "next/link";

import CategoryMegaMenu from "./CategoryMegaMenu";
import HeaderAuthActions from "./HeaderAuthActions";
import MobileNavigation from "./MobileNavigation";
import GlobalSearch from "./GlobalSearch";
import ActiveNavigation from "./ActiveNavigation";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Stores", href: "/stores" },
  { label: "Coupons", href: "/coupons" },
  { label: "Blog", href: "/blogs" },
];

const secondaryNavigation = [
  { label: "All stores", href: "/stores" },
  { label: "Latest coupons", href: "/coupons" },
  { label: "Latest deals", href: "/coupons?type=deal" },
  { label: "Latest articles", href: "/blogs?sort=latest" },
];

export default function PublicHeader() {
  return (
    <header
      className="sticky top-0 z-[999] border-b"
      style={{
        backgroundColor: "var(--background)",
        borderColor: "var(--border)",
      }}
    >
      {/* Primary header */}
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:gap-5 sm:px-6 lg:px-8">
        {/* Left: Mobile menu + Logo */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="md:hidden">
            <MobileNavigation />
          </div>

          <Link
            href="/"
            aria-label="CouponsNext homepage"
            className="shrink-0 font-heading text-[20px] font-extrabold tracking-tight sm:text-2xl"
          >
            <span style={{ color: "var(--brand-purple)" }}>
              Coupons
            </span>
            <span style={{ color: "var(--brand-yellow)" }}>
              Next
            </span>
          </Link>
        </div>

        {/* Desktop Search: Large screens */}
        <div className="hidden max-w-md flex-1 lg:mx-4 lg:block">
          <GlobalSearch
            placeholder="Search stores, coupons and deals..."
          />
        </div>

        {/* Main Navigation */}
        <ActiveNavigation
          items={navigation}
          ariaLabel="Main navigation"
        />

        {/* Authentication Actions */}
        <div className="ml-auto flex shrink-0 items-center justify-end md:ml-0">
          <HeaderAuthActions />
        </div>
      </div>

      {/* Secondary Navigation */}
      <div
        className="hidden border-t md:block"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="mx-auto flex min-h-11 max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6 lg:px-8">
          {/* Categories */}
          <CategoryMegaMenu />

          {/* Medium screen search */}
          <div className="mx-auto hidden w-full max-w-[280px] flex-1 md:flex md:items-center lg:hidden">
            <GlobalSearch placeholder="Search stores, coupons and deals..." />
          </div>

          {/* Quick Links */}
          <ActiveNavigation
            items={secondaryNavigation}
            ariaLabel="Quick links"
            secondary
          />
        </div>
      </div>
    </header>
  );
}
