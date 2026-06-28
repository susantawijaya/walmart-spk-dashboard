import type { Metadata } from "next";

import { SpkClient } from "@/components/spk/spk-client";
import { getSuperstoreSales } from "@/lib/data/repository";

export const metadata: Metadata = { title: "SPK AHP-TOPSIS - Superstore" };

export default function SpkPage() {
  const records = getSuperstoreSales();
  return (
    <div className="container page-space">
      <section className="page-hero page-hero--compact">
        <div>
          <span className="eyebrow">Sistem Pendukung Keputusan</span>
          <h1>Decision Studio Produk Superstore</h1>
          <p>
            Sistem ini membantu memilih produk yang paling layak diprioritaskan untuk
            promosi dan stok berdasarkan sales aktual, profit, quantity, margin, diskon,
            dan risiko transaksi rugi.
          </p>
        </div>
      </section>
      <SpkClient records={records} />
    </div>
  );
}
