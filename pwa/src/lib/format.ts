// format.ts — shared formatting helpers used across screens.

/** Covered m² from a floor area + coverage percentage. */
export const roundM = (area: number, pct: number): number => Math.round((area * pct) / 100);

/** Clamp a number to 0–100 and round (coverage %). */
export const clampPct = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** ISO `YYYY-MM-DD` → `DD MMM YYYY` (e.g. "2026-06-09" → "09 Jun 2026"). */
export function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${d} ${MONTHS[Number(mo) - 1]} ${y}`;
}

/** ISO → `DD MMM` (no year), for compact timelines. */
export function fmtDateShort(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, , mo, d] = m;
  return `${d} ${MONTHS[Number(mo) - 1]}`;
}
