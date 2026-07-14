export function formatCoins(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

let uidCounter = 0;
export function uid(prefix = "id"): string {
  uidCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${uidCounter}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}
