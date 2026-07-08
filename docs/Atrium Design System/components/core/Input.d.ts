import * as React from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "style"> {
  /** Field label rendered above the input. */
  label?: string;
  /** Helper / error text below the input. */
  hint?: string;
  /** Error styling (amber border + hint). @default false */
  invalid?: boolean;
  /** Style for the wrapper. */
  style?: React.CSSProperties;
  /** Style for the <input> itself. */
  inputStyle?: React.CSSProperties;
}

/**
 * Clean text field with optional label + hint. Hairline border deepens to teal
 * on focus with an amber focus ring. For light surfaces.
 */
export function Input(props: InputProps): JSX.Element;
