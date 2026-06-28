"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/spk", label: "SPK" },
  { href: "/business-questions", label: "Questions" },
  { href: "/kredit", label: "Kredit" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label="Beranda SPK Superstore">
          <span className="brand__mark" aria-hidden="true">S</span>
          <span>
            <strong>Superstore Insight</strong>
            <small>SPK Prioritas Produk</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="Navigasi utama">
          {navigation.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                className={active ? "main-nav__link is-active" : "main-nav__link"}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
