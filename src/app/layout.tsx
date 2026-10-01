
import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}