const number = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

export function formatCurrency(value: number): string {
  return `US$${number.format(value)}`;
}

export function formatNumber(value: number): string {
  return number.format(value);
}

export function formatPercentage(value: number, digits = 1): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatScore(value: number): string {
  return decimal.format(value);
}

export function formatDecimal(value: number, digits = 2): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  const compact = new Intl.NumberFormat("id-ID", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
  return `US$${compact}`;
}

export function formatMonthLabel(value: string): string {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}
