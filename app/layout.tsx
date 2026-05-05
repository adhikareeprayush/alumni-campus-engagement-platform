import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BRAND } from "@/lib/brand";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: `${BRAND.siteName} — ${BRAND.institutionShort}`,
    template: `%s | ${BRAND.siteName}`,
  },
  description: BRAND.seoDescription,
  icons: {
    icon: [{ url: "/brand/summitlink-mark.svg", type: "image/svg+xml" }],
    apple: "/brand/summitlink-mark.svg",
    shortcut: "/brand/summitlink-mark.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
