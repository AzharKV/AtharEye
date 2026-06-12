import * as React from 'react';
/**
 * Primary tap target. Navy filled by default; ghost (bordered) and teal variants.
 * @startingPoint section="Buttons" subtitle="Navy / ghost / teal action button" viewport="320x80"
 */
export interface ButtonProps {
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'ghost' | 'teal';
  /** @default "md" */
  size?: 'md' | 'sm';
  /** Stretch to full container width. */
  block?: boolean;
  /** Optional leading icon (18px svg). */
  icon?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
}
export function Button(props: ButtonProps): JSX.Element;
