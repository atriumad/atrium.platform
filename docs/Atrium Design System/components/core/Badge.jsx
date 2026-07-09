import React from "react";

/**
 * Atrium Badge — small status / category tag. Smaller and flatter than a Chip;
 * not interactive.
 */
export function Badge({ children, tone = "mint", style = {}, ...rest }) {
  const tones = {
    mint: { background: "var(--mint-300)", color: "var(--teal-800)" },
    teal: { background: "var(--teal-800)", color: "var(--mint-400)" },
    amber: { background: "var(--amber-400)", color: "var(--teal-800)" },
    cloud: { background: "var(--cloud-300)", color: "var(--teal-700)" },
    outline: { background: "transparent", color: "var(--teal-800)", boxShadow: "inset 0 0 0 1.5px var(--teal-800)" },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontFamily: "var(--font-sans)",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        lineHeight: 1,
        padding: "5px 10px",
        borderRadius: "var(--radius-pill)",
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
