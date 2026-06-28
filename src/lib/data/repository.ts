import superstoreSales from "../../../data/processed/superstore_sales.json";
import productMetrics from "../../../data/processed/product_metrics.json";
import spkResult from "../../../data/processed/spk_result.json";
import summary from "../../../data/processed/summary.json";

import type {
  DatasetSummary,
  ProductMetric,
  SpkResult,
  SuperstoreSalesRecord,
} from "@/lib/data/contracts";

export function getSuperstoreSales(): SuperstoreSalesRecord[] {
  return superstoreSales as SuperstoreSalesRecord[];
}

export function getProductMetrics(): ProductMetric[] {
  return productMetrics as ProductMetric[];
}

export function getSpkResult(): SpkResult {
  return spkResult as SpkResult;
}

export function getDatasetSummary(): DatasetSummary {
  return summary as DatasetSummary;
}
