import * as React from 'react';
/**
 * Per-zone coverage as labelled horizontal bars; bars turn teal at 100%.
 * @startingPoint section="Data viz" subtitle="Per-zone coverage bars" viewport="360x220"
 */
export interface Zone { name: string; coverage: number; area?: number; }
export interface ZoneBarsProps {
  zones?: Zone[];
}
export function ZoneBars(props: ZoneBarsProps): JSX.Element;
