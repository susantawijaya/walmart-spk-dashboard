import type { Metadata } from "next";

import { SpkClient } from "@/components/spk/spk-client";
import { getWeeklySales } from "@/lib/data/repository";

export const metadata: Metadata = { title: "SPK AHP–TOPSIS" };

export default function SpkPage() {
  const records = getWeeklySales();
  return (
    <div className="container page-space">
      <section className="page-hero page-hero--compact">
        <div>
          <span className="eyebrow">Sistem Pendukung Keputusan</span>
          <h1>Decision Studio AHP–TOPSIS</h1>
          <p>
            Masukkan prioritas manajemen, hitung bobot AHP, dan dapatkan rekomendasi
            toko penerima anggaran pengembangan melalui TOPSIS.
          </p>
        </div>
      </section>
      <SpkClient records={records} />
    </div>
  );
}
