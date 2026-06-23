import weeklySales from "../../../data/processed/weekly_sales.json";
import storeMetrics from "../../../data/processed/store_metrics.json";
import spkResult from "../../../data/processed/spk_result.json";
import summary from "../../../data/processed/summary.json";

import type {
  DatasetSummary,
  SpkResult,
  StoreMetric,
  WeeklySalesRecord,
} from "@/lib/data/contracts";

export function getWeeklySales(): WeeklySalesRecord[] {
  return weeklySales as WeeklySalesRecord[];
}

export function getStoreMetrics(): StoreMetric[] {
  return storeMetrics as StoreMetric[];
}

export function getSpkResult(): SpkResult {
  return spkResult as SpkResult;
}

export function getDatasetSummary(): DatasetSummary {
  return summary as DatasetSummary;
}
