import React from "react";

/**
 * Atrium Card — color-led OR soft-aurora surface. Flat tones get elevation
 * from the field color; the `aurora` / `aurora-mint` / `aurora-amber` tones are
 * the warmer "bento" gradient cards. Pass `elevation="soft|float"` for the
 * diffuse bento shadow and `radius="var(--radius-bento)"` for big corners.
 */
export function Card({
  children,
  tone = "light",
  padding = "28px",
  radius = "var(--radius-md)",
  bordered = false,
  hover = false,
  elevation = "none",
  style = {},
  ...rest
}) {
  const tones = {
    light: { background: "var(--surface-card)", color: "var(--text-body)", border: bordered ? "1px solid var(--cloud-400)" : "1px solid transparent" },
    cloud: { background: "var(--cloud-300)", color: "var(--text-body)", border: "1px solid transparent" },
    mint: { background: "var(--mint-400)", color: "var(--teal-800)", border: "1px solid transparent" },
    amber: { background: "var(--amber-500)", color: "var(--teal-800)", border: "1px solid transparent" },
    teal: { background: "var(--teal-800)", color: "var(--text-on-dark)", border: "1px solid transparent" },
    aurora: { background: "var(--grad-aurora)", color: "var(--text-body)", border: "1px solid transparent" },
    "aurora-mint": { background: "var(--grad-aurora-mint)", color: "var(--teal-800)", border: "1px solid transparent" },
    "aurora-amber": { background: "var(--grad-aurora-amber)", color: "var(--teal-800)", border: "1px solid transparent" },
  };
  const baseShadow = { none: "none", soft: "var(--shadow-soft)", float: "var(--shadow-float)" }[elevation] || "none";
  const [h, setH] = React.useState(false);
  return (
    <div
      onPointerEnter={() => hover && setH(true)}
      onPointerLeave={() => hover && setH(false)}
      style={{
        position: "relative",
        borderRadius: radius,
        padding,
        overflow: "hidden",
        transition: "transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out)",
        transform: h ? "translateY(-5px)" : "none",
        boxShadow: h ? "var(--shadow-float)" : baseShadow,
        ...tones[tone],
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
