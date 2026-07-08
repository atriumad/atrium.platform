import * as React from "react";

export interface ScriptAccentProps {
  children?: React.ReactNode;
  /** Underline the word (the brand default). @default true */
  underline?: boolean;
  /** Text color. @default "inherit" */
  color?: string;
  style?: React.CSSProperties;
}

/**
 * Handwritten accent word (Nothing You Could Do) for warmth inside a headline —
 * "We're humans", "Welcome to atrium". Usually underlined.
 */
export function ScriptAccent(props: ScriptAccentProps): JSX.Element;
