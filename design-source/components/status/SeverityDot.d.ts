import * as React from 'react';
/**
 * Issue severity indicator. Critical = red, Major = amber, Minor = grey. Optional trailing label.
 */
export interface SeverityDotProps {
  severity?: 'Critical' | 'Major' | 'Minor';
  label?: string;
}
export function SeverityDot(props: SeverityDotProps): JSX.Element;
