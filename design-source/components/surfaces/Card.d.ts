import * as React from 'react';
/**
 * Base surface — white, hairline border, soft radius, subtle shadow. The default container for everything.
 * @startingPoint section="Surfaces" subtitle="White card surface" viewport="360x140"
 */
export interface CardProps {
  /** Apply 16px internal padding. @default true */
  pad?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}
export function Card(props: CardProps): JSX.Element;

export interface SectionHeaderProps {
  label: string;
  /** Optional count shown next to the label. */
  count?: number;
  /** Show a navy "+ Add" affordance and call this on tap. */
  onAdd?: () => void;
  /** Custom right-side node (used when onAdd is not set). */
  right?: React.ReactNode;
}
export function SectionHeader(props: SectionHeaderProps): JSX.Element;
