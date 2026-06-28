import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SPK Prioritas Produk Superstore",
    template: "%s | SPK Superstore",
  },
  description:
    "Dashboard sales dan sistem pendukung keputusan prioritas produk Superstore menggunakan AHP dan TOPSIS.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container site-footer__inner">
            <span>SPK Prioritas Produk Superstore</span>
            <span>&copy; 2026 Gede Susanta Wijaya (322410006) &amp; Xander Covelin (322410017)</span>
            <span>Dataset Sample Superstore - AHP-TOPSIS</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
