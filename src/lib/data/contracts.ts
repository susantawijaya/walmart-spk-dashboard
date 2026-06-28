export type DiscountRange = "0%" | "1-10%" | "11-20%" | "21-30%" | ">30%";

export interface SuperstoreSalesRecord {
  rowId: number;
  orderId: string;
  orderDate: string;
  shipDate: string;
  orderMonth: string;
  orderYear: number;
  shipMode: string;
  customerId: string;
  customerName: string;
  segment: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  region: string;
  productId: string;
  category: string;
  subCategory: string;
  productName: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
  profitMargin: number;
  shippingDays: number;
  discountRange: DiscountRange;
  isLoss: boolean;
}

export interface ProductMetric {
  productId: string;
  productName: string;
  category: string;
  subCategory: string;
  totalSales: number;
  totalProfit: number;
  totalQuantity: number;
  orderCount: number;
  customerCount: number;
  averageDiscount: number;
  profitMargin: number;
  lossOrderRatio: number;
  averageShippingDays: number;
}

export interface CriterionDefinition {
  id: string;
  code: string;
  label: string;
  description: string;
  type: "benefit" | "cost";
  weight: number;
  metricKey: keyof ProductMetric;
  format: "currency" | "percentage" | "number" | "days";
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
  productId: string;
  score: number;
  distancePositive: number;
  distanceNegative: number;
  metrics: ProductMetric;
}

export interface SpkResult {
  generatedAt: string;
  method: "AHP-TOPSIS";
  criteria: CriterionDefinition[];
  pairwiseMatrix: number[][];
  ahp: AhpResult;
  rankings: TopsisRanking[];
}

export interface CategorySummary {
  category: string;
  totalSales: number;
  totalProfit: number;
  totalQuantity: number;
  orderCount: number;
  profitMargin: number;
  averageDiscount: number;
}

export interface DatasetSummary {
  dataset: {
    title: string;
    sourceUrl: string;
    uploader: string;
    fileName: string;
    rowCount: number;
    columnCount: number;
    orderCount: number;
    customerCount: number;
    productCount: number;
    categories: string[];
    subCategoryCount: number;
    dateRange: {
      start: string;
      end: string;
    };
    missingCellCount: number;
  };
  overall: {
    totalSales: number;
    totalProfit: number;
    totalQuantity: number;
    orderCount: number;
    profitMargin: number;
    averageDiscount: number;
    averageShippingDays: number;
    lossOrderRatio: number;
    bestSalesCategory: string;
    bestProfitSubCategory: string;
    worstProfitSubCategory: string;
  };
  categories: CategorySummary[];
}
