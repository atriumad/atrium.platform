import * as React from "react";

export interface HighlightProps {
  children?: React.ReactNode;
  /** Marker color. @default "amber" */
  color?: "amber" | "mint" | "teal";
  style?: React.CSSProperties;
}

/**
 * The signature Atrium marker swipe — an amber (or mint/teal) highlighter band
 * sitting low behind an emphasised word. Inline; wraps cleanly across lines.
 */
export function Highlight(props: HighlightProps): JSX.Element;
