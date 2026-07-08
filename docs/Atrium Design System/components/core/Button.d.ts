import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: "primary" | "mint" | "amber" | "outline" | "ghost";
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Render as a different element, e.g. "a". @default "button" */
  as?: keyof JSX.IntrinsicElements;
  /** Icon node placed before the label. */
  iconLeft?: React.ReactNode;
  /** Icon node placed after the label. */
  iconRight?: React.ReactNode;
  /** Stretch to fill the container width. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * Stadium-pill button — Atrium's primary action. Flat color fields, press
 * scales to 0.97, hover deepens the field. `outline` inverts to mint on hover.
 *
 * @startingPoint section="Core" subtitle="Pill buttons — primary, mint, amber, outline" viewport="700x240"
 */
export function Button(props: ButtonProps): JSX.Element;
