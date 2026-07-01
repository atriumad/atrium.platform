import * as React from "react";

export interface ChipProps {
  children?: React.ReactNode;
  /** Color treatment. @default "outline" */
  variant?: "outline" | "outline-light" | "outline-soft" | "mint" | "mint-soft" | "teal" | "ink" | "amber";
  /** Filled selected state (overrides variant to teal field). @default false */
  selected?: boolean;
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";
  /** When provided, the chip becomes an interactive toggle. */
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

/**
 * Stadium service pill — Atrium's signature outlined chip (Seo, Marketing,
 * Graphic Design, Photography). Use `outline-light` on deep-teal fields.
 */
export function Chip(props: ChipProps): JSX.Element;
