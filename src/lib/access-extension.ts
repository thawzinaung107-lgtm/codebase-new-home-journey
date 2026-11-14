const DAY = 86_400_000;
/** New expiry when adding days: counts from the current expiry if still in the future, otherwise from now. */
export function extendExpiry(current: string, days: number, now = Date.now()) {
  if (!Number.isInteger(days) || days <= 0) throw new Error('Days must be a positive whole number');
  const base = Math.max(Date.parse(current) || 0, now);
  return new Date(base + days * DAY).toISOString();
}
