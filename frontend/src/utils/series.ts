export type RangeKey = '30D' | '90D' | '6M' | '1Y' | 'ALL';

export const RANGE_KEYS: RangeKey[] = ['30D', '90D', '6M', '1Y', 'ALL'];

const RANGE_DAYS: Record<RangeKey, number> = {
  '30D': 30,
  '90D': 90,
  '6M': 182,
  '1Y': 365,
  ALL: Number.MAX_SAFE_INTEGER,
};

/** Deterministic PRNG so mock series render identically on every load. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Keep at most `maxPoints` samples, evenly spaced, always including the last. */
export function thin<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = Math.ceil(arr.length / maxPoints);
  return arr.filter((_, i) => i % step === 0 || i === arr.length - 1);
}

/** Slice a dated series to a named range and thin it for chart rendering. */
export function sliceRange<T extends { date: string }>(
  points: T[],
  range: RangeKey,
  maxPoints = 120,
): T[] {
  if (points.length === 0) return points;
  const end = new Date(points[points.length - 1].date).getTime();
  const cutoff = end - RANGE_DAYS[range] * 86400000;
  const sliced = points.filter((p) => new Date(p.date).getTime() >= cutoff);
  return thin(sliced, maxPoints);
}
