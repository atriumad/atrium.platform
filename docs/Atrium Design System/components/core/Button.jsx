import React from "react";

/**
 * Atrium Button — stadium-pill action. Flat, confident, color-led.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  as = "button",
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: "8px 16px", fontSize: "13px", gap: "6px" },
    md: { padding: "12px 24px", fontSize: "15px", gap: "8px" },
    lg: { padding: "16px 34px", fontSize: "17px", gap: "10px" },
  };
  const variants = {
    primary: { background: "var(--teal-800)", color: "var(--mint-400)", border: "1.5px solid var(--teal-800)" },
    mint: { background: "var(--mint-400)", color: "var(--teal-800)", border: "1.5px solid var(--mint-400)" },
    amber: { background: "var(--amber-500)", color: "var(--teal-800)", border: "1.5px solid var(--amber-500)" },
    outline: { background: "transparent", color: "var(--teal-800)", border: "1.5px solid var(--teal-800)" },
    ghost: { background: "transparent", color: "var(--teal-800)", border: "1.5px solid transparent" },
  };

  const Comp = as;
  const [pressed, setPressed] = React.useState(false);
  const [hover, setHover] = React.useState(false);

  const hoverBg = {
    primary: "var(--teal-900)",
    mint: "var(--mint-500)",
    amber: "var(--amber-600)",
    outline: "var(--teal-800)",
    ghost: "var(--cloud-300)",
  }[variant];
  const hoverColor = variant === "outline" ? "var(--mint-400)" : undefined;

  return (
    <Comp
      disabled={as === "button" ? disabled : undefined}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => { setPressed(false); setHover(false); }}
      onPointerEnter={() => setHover(true)}
      style={{
        display: fullWidth ? "flex" : "inline-flex",
        width: fullWidth ? "100%" : undefined,
        alignItems: "center",
        justifyContent: "center",
        gap: sizes[size].gap,
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        lineHeight: 1,
        letterSpacing: "0.01em",
        borderRadius: "var(--radius-pill)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "transform var(--dur-fast) var(--ease-out), background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out)",
        transform: pressed ? "scale(0.97)" : "scale(1)",
        ...sizes[size],
        ...variants[variant],
        ...(hover && !disabled ? { background: hoverBg, color: hoverColor } : {}),
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </Comp>
  );
}
