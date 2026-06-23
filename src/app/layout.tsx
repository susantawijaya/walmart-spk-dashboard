import type { Metadata } from "next";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SPK Prioritas Toko Walmart",
    template: "%s | SPK Walmart",
  },
  description:
    "Dashboard penjualan dan sistem pendukung keputusan prioritas toko Walmart menggunakan AHP dan TOPSIS.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container site-footer__inner">
            <span>SPK Prioritas Toko Walmart</span>
            <span>&copy; 2026 Gede susanta wijaya (322410006) &amp; Xander Covelin (322410017)</span>
            <span>Dataset Walmart Sales · AHP–TOPSIS</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
