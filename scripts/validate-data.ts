import { readFile } from "node:fs/promises";
import path from "node:path";

import { buildSpkResult } from "../src/lib/analytics/decision";
import {
  EXPECTED_COLUMNS,
  buildDatasetSummary,
  buildProductMetrics,
  parseSuperstoreCsv,
} from "../src/lib/data/process";

const csvPath = path.join(process.cwd(), "dataset", "Sample - Superstore.csv");
const records = parseSuperstoreCsv(await readFile(csvPath, "utf8"));
const metrics = buildProductMetrics(records);
const summary = buildDatasetSummary(records);
const spk = buildSpkResult(metrics);

const assertions: Array<[boolean, string]> = [
  [records.length === 9994, "Dataset harus memiliki 9.994 baris."],
  [EXPECTED_COLUMNS.length === 21, "Dataset harus memiliki 21 kolom."],
  [summary.dataset.orderCount === 5009, "Dataset harus mencakup 5.009 order aktual."],
  [metrics.length === 1862, "Dataset harus mencakup 1.862 produk unik."],
  [summary.dataset.customerCount === 793, "Dataset harus mencakup 793 customer."],
  [summary.dataset.categories.length === 3, "Dataset harus memiliki 3 category utama."],
  [spk.rankings.length === 1862, "TOPSIS harus menghasilkan 1.862 peringkat."],
  [spk.ahp.isConsistent, "Matriks AHP harus konsisten (CR <= 0,1)."],
  [
    spk.rankings.every((item, index) => item.rank === index + 1),
    "Nomor peringkat TOPSIS harus berurutan.",
  ],
];

const failure = assertions.find(([passed]) => !passed);
if (failure) {
  throw new Error(failure[1]);
}

console.log("Validasi data berhasil.");
console.log("9.994 baris, 21 kolom, 5.009 order aktual.");
console.log("Sales, quantity, discount, dan profit dipakai sebagai metrik bisnis aktual.");
console.log(
  `Produk unik: ${metrics.length.toLocaleString("id-ID")}. Customer: ${summary.dataset.customerCount.toLocaleString("id-ID")}.`,
);
console.log(`CR AHP: ${spk.ahp.consistencyRatio.toFixed(6)}.`);
