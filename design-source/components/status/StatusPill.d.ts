import * as React from 'react';
/**
 * Project-health pill: a coloured dot + label. On track / Needs review (amber) / Behind / Complete.
 */
export interface StatusPillProps {
  status?: 'On track' | 'Needs review' | 'Behind' | 'Complete';
}
export function StatusPill(props: StatusPillProps): JSX.Element;
