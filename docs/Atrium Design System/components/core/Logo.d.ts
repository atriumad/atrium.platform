import * as React from "react";

export interface LogoProps {
  /** Which lockup to render. @default "wordmark" */
  variant?: "mark" | "wordmark" | "lockup";
  /** Any CSS color / brand token applied via mask. @default "var(--teal-800)" */
  color?: string;
  /** Rendered height in px. @default 32 */
  height?: number;
  /** Folder containing atrium-mark.svg / atrium-wordmark.svg. @default "../../assets/logos" */
  assetBase?: string;
  /** Gap between mark and wordmark in the lockup, px. @default 14 */
  gap?: number;
  style?: React.CSSProperties;
}

/**
 * Atrium logo — α monogram, lowercase wordmark, or horizontal lockup.
 * Recolors through CSS mask, so it works on any field. Set `assetBase` to the
 * relative path of the logo SVGs from the consuming page.
 */
export function Logo(props: LogoProps): JSX.Element;
