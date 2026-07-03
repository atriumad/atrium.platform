import * as React from "react";

export interface BadgeProps {
  children?: React.ReactNode;
  /** Color. @default "mint" */
  tone?: "mint" | "teal" | "amber" | "cloud" | "outline";
  style?: React.CSSProperties;
}

/**
 * Small, flat status / category tag (non-interactive). Smaller than a Chip —
 * use for labels like "New", "Featured", a post category.
 */
export function Badge(props: BadgeProps): JSX.Element;
