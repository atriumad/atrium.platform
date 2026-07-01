import React from "react";

/**
 * Atrium Highlight — the signature marker swipe behind an emphasised word.
 * A hand-drawn-feeling amber (or mint) band sits low behind the text.
 */
export function Highlight({ children, color = "amber", style = {}, ...rest }) {
  const band = {
    amber: "var(--amber-400)",
    mint: "var(--mint-400)",
    teal: "var(--teal-800)",
  }[color];
  const ink = color === "teal" ? "var(--mint-400)" : "inherit";
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${band}, ${band})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% 62%",
        backgroundPosition: "0 74%",
        padding: "0 0.12em",
        color: ink,
        WebkitBoxDecorationBreak: "clone",
        boxDecorationBreak: "clone",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
