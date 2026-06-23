import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container empty-state page-space">
      <span className="eyebrow">404</span>
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang Anda buka tidak tersedia di sistem ini.</p>
      <Link className="button button--primary" href="/">Kembali ke Dashboard</Link>
    </section>
  );
}
