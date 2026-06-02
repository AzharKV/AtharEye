// format.ts — shared formatting helpers used across screens.
import { DATA } from '../data';

/** Covered m² from a floor area + coverage percentage. */
export const roundM = (area: number, pct: number): number => Math.round((area * pct) / 100);

/** Map team initials → full display name (falls back to the initials). */
export const teamName = (initials: string): string => DATA.teamNames[initials] || initials;
