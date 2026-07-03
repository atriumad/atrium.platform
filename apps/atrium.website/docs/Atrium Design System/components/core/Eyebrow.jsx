import React from "react";

/**
 * Atrium Eyebrow — the wide letter-spaced caps label used above headings
 * and as section markers ("THE EXPERIENCE ERA", "MEDIA AND ADVERTISING").
 */
export function Eyebrow({ children, tone = "muted", spread = "wide", as = "div", style = {}, ...rest }) {
  const Comp = as;
  const colors = {
    muted: "var(--text-muted)",
    teal: "var(--teal-800)",
    mint: "var(--mint-400)",
    amber: "var(--amber-500)",
    onDark: "var(--teal-300)",
  };
  const tracking = { wide: "0.18em", widest: "0.32em" }[spread];
  return (
    <Comp
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "0.8125rem",
        fontWeight: 600,
        letterSpacing: tracking,
        textTransform: "uppercase",
        color: colors[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}
