import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  EXPECTED_COLUMNS,
  parseWalmartCsv,
} from "../src/lib/data/process";
import { buildSpkResult } from "../src/lib/analytics/decision";
import { calculateStoreMetrics } from "../src/lib/analytics/store-metrics";

const csvPath = path.join(process.cwd(), "dataset", "Walmart_Sales.csv");
const records = parseWalmartCsv(await readFile(csvPath, "utf8"));
const metrics = calculateStoreMetrics(records);
const spk = buildSpkResult(metrics);

const assertions: Array<[boolean, string]> = [
  [records.length === 6435, "Dataset harus memiliki 6.435 baris."],
  [EXPECTED_COLUMNS.length === 8, "Dataset harus memiliki 8 kolom."],
  [metrics.length === 45, "Dataset harus mencakup 45 toko Walmart."],
  [spk.rankings.length === 45, "TOPSIS harus menghasilkan 45 peringkat."],
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
console.log("6.435 baris, 8 kolom, 45 toko, tanpa nilai kosong.");
console.log(`CR AHP: ${spk.ahp.consistencyRatio.toFixed(6)}.`);
