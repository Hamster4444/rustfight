export interface Weighted<T> {
  item: T;
  weight: number;
}

export function weightedPick<T>(pool: Weighted<T>[]): T {
  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * total;
  for (const p of pool) {
    roll -= p.weight;
    if (roll <= 0) return p.item;
  }
  return pool[pool.length - 1].item;
}

export function pickIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

/** Mock provably-fair style hash (not cryptographic — demo only). */
export function randomHash(length = 64): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function randomOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
