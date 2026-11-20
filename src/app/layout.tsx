import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import NextTopLoader from "nextjs-toploader";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CouponsNext | Deals, Coupons & Offers",
    template: "%s | CouponsNext",
  },
  description:
    "Discover the latest coupons, promo codes and deals from popular stores.",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${plusJakarta.variable}`}>
        <ToastProvider>
          <AuthProvider>
            <NextTopLoader
              color="var(--brand-purple)"
              initialPosition={0.08}
              crawlSpeed={200}
              height={3}
              crawl
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px var(--brand-purple), 0 0 5px var(--brand-purple)"
              zIndex={9999}
            />
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}