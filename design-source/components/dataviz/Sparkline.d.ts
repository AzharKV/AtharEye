import * as React from 'react';
/**
 * Coverage-over-time area sparkline; final point highlighted teal.
 */
export interface SparklineProps {
  /** Array of numbers (0–100) or objects with a `coverage` field. */
  points?: Array<number | { coverage: number }>;
  w?: number;
  h?: number;
}
export function Sparkline(props: SparklineProps): JSX.Element;
