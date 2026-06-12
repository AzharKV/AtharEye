import * as React from 'react';
/**
 * Labelled form control — text, number, select or textarea. The atom inside every editor sheet.
 * @startingPoint section="Forms" subtitle="Labelled input / select / textarea" viewport="360x110"
 */
export interface FieldProps {
  label?: string;
  /** @default "text" */
  type?: 'text' | 'number' | 'select' | 'textarea' | 'email';
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Options for type="select". */
  options?: string[];
  /** Helper text under the control. */
  hint?: string;
  rows?: number;
}
export function Field(props: FieldProps): JSX.Element;

export interface SegmentedProps {
  value?: string;
  options?: string[];
  onChange?: (value: string) => void;
}
export function Segmented(props: SegmentedProps): JSX.Element;
