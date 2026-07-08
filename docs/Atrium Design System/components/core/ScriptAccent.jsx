import React from "react";

/**
 * Atrium ScriptAccent — a handwritten word (Nothing You Could Do), usually
 * underlined, dropped into a headline for warmth ("Welcome to atrium").
 */
export function ScriptAccent({ children, underline = true, color = "inherit", style = {}, ...rest }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-script)",
        fontWeight: 400,
        color,
        textDecoration: underline ? "underline" : "none",
        textDecorationThickness: "2px",
        textUnderlineOffset: "3px",
        lineHeight: 1.1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
