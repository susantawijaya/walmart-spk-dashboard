import { describe, expect, it } from "vitest";

import { calculateTopsis } from "@/lib/analytics/topsis";

describe("TOPSIS", () => {
  it("menempatkan alternatif yang paling ideal di posisi pertama", () => {
    const result = calculateTopsis(
      [
        { id: 1, values: [90, 10], data: "A" },
        { id: 2, values: [70, 20], data: "B" },
        { id: 3, values: [50, 30], data: "C" },
      ],
      [0.7, 0.3],
      ["benefit", "cost"],
    );

    expect(result.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(result[0].score).toBeGreaterThan(result[1].score);
  });

  it("menolak bobot yang totalnya bukan satu", () => {
    expect(() =>
      calculateTopsis(
        [{ id: 1, values: [1, 2], data: null }],
        [0.5, 0.4],
        ["benefit", "benefit"],
      ),
    ).toThrow(/bernilai 1/i);
  });
});
