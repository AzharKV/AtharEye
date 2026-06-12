import * as React from 'react';
/**
 * Project build-stage chip with the locked colour key: Early = navy, Mid = blue, Complete = teal.
 * @startingPoint section="Status" subtitle="Build-stage chip (Early/Mid/Complete)" viewport="320x60"
 */
export interface StageChipProps {
  /** Base stage — sets the colour. @default "Early" */
  stage?: 'Early' | 'Mid' | 'Complete';
  /** Override the visible text (e.g. a finer label like "Finishing") while keeping the stage colour. */
  label?: string;
}
export function StageChip(props: StageChipProps): JSX.Element;
