import * as React from "react";

export interface CardProps {
  children?: React.ReactNode;
  /** Field color, or a soft "bento" aurora gradient. @default "light" */
  tone?: "light" | "cloud" | "mint" | "amber" | "teal" | "aurora" | "aurora-mint" | "aurora-amber";
  /** Inner padding. @default "28px" */
  padding?: string;
  /** Corner radius. Use "var(--radius-bento)" for the soft bento look. @default "var(--radius-md)" */
  radius?: string;
  /** Hairline border (light tone only). @default false */
  bordered?: boolean;
  /** Lift + float shadow on hover. @default false */
  hover?: boolean;
  /** Resting diffuse shadow for floating bento tiles. @default "none" */
  elevation?: "none" | "soft" | "float";
  style?: React.CSSProperties;
}

/**
 * Color-led OR soft-aurora surface. Flat tones get elevation from the field
 * color; `aurora*` tones are the warmer bento gradient cards. Use `elevation`
 * for the diffuse float shadow and a large `radius` for the bento corners.
 *
 * @startingPoint section="Core" subtitle="Color-led surface cards" viewport="700x260"
 */
export function Card(props: CardProps): JSX.Element;
