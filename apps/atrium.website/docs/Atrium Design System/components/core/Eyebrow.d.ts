import * as React from "react";

export interface EyebrowProps {
  children?: React.ReactNode;
  /** Color. @default "muted" */
  tone?: "muted" | "teal" | "mint" | "amber" | "onDark";
  /** Letter-spacing spread. @default "wide" */
  spread?: "wide" | "widest";
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}

/**
 * Wide letter-spaced caps label — Atrium's section eyebrow / kicker. Pair above
 * a display heading. Use `onDark` / `mint` tones on deep-teal fields.
 */
export function Eyebrow(props: EyebrowProps): JSX.Element;
