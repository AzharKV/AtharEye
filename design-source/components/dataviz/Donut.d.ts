import * as React from 'react';
/**
 * Coverage ring — the signature OptiSync data-viz. Animated %, teal at 100%.
 * @startingPoint section="Data viz" subtitle="Coverage % donut ring" viewport="180x180"
 */
export interface DonutProps {
  /** Coverage percentage 0–100. */
  value?: number;
  /** Outer diameter in px. @default 132 */
  size?: number;
  /** Ring thickness. @default 13 */
  stroke?: number;
  /** Override ring colour. Defaults to navy, or teal when value is 100. */
  color?: string;
  /** Caption under the number. @default "coverage" */
  label?: string;
  /** Small mono sub-caption (e.g. "62% verified · 38% left"). */
  sub?: string;
}
export function Donut(props: DonutProps): JSX.Element;
