export interface WeeklySalesRecord {
  store: number;
  date: string;
  year: number;
  weeklySales: number;
  isHoliday: boolean;
  temperature: number;
  fuelPrice: number;
  cpi: number;
  unemployment: number;
}

export interface StoreMetric {
  store: number;
  recordCount: number;
  totalSales: number;
  averageWeeklySales: number;
  averageHolidaySales: number;
  averageRegularSales: number;
  holidayLift: number;
  salesGrowthRate: number;
  highSalesWeekRate: number;
  salesVolatility: number;
  lowSalesWeekRate: number;
  bestWeeklySales: number;
  averageTemperature: number;
  averageFuelPrice: number;
  averageCpi: number;
  averageUnemployment: number;
}

export interface CriterionDefinition {
  id: string;
  code: string;
  label: string;
  description: string;
  type: "benefit" | "cost";
  weight: number;
  metricKey: keyof StoreMetric;
  format: "currency" | "percentage";
}

export interface AhpResult {
  weights: number[];
  lambdaMax: number;
  consistencyIndex: number;
  randomIndex: number;
  consistencyRatio: number;
  isConsistent: boolean;
}

export interface TopsisRanking {
  rank: number;
  store: number;
  score: number;
  distancePositive: number;
  distanceNegative: number;
  metrics: StoreMetric;
}

export interface SpkResult {
  generatedAt: string;
  method: "AHP-TOPSIS";
  criteria: CriterionDefinition[];
  pairwiseMatrix: number[][];
  ahp: AhpResult;
  rankings: TopsisRanking[];
}

export interface YearSummary {
  year: number;
  totalSales: number;
  averageWeeklySales: number;
  recordCount: number;
}

export interface DatasetSummary {
  dataset: {
    title: string;
    sourceUrl: string;
    fileName: string;
    rowCount: number;
    columnCount: number;
    storeCount: number;
    years: number[];
    startDate: string;
    endDate: string;
    missingCellCount: number;
  };
  overall: {
    totalSales: number;
    averageWeeklySales: number;
    bestWeeklySales: number;
    holidaySales: number;
    nonHolidaySales: number;
    bestYear: number;
    bestYearSales: number;
  };
  years: YearSummary[];
}
