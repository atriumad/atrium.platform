import React from "react";

/**
 * Atrium Input — clean text field with optional label. Hairline border that
 * deepens to teal on focus with an amber focus ring. Works on light surfaces.
 */
export function Input({
  label,
  hint,
  id,
  type = "text",
  invalid = false,
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "7px", ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "var(--text-strong)",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "15px",
          color: "var(--text-body)",
          background: "var(--cloud-100)",
          padding: "12px 16px",
          borderRadius: "var(--radius-sm)",
          border: `1.5px solid ${invalid ? "var(--amber-600)" : focus ? "var(--teal-800)" : "var(--cloud-400)"}`,
          outline: focus ? "2px solid var(--focus-ring)" : "2px solid transparent",
          outlineOffset: "2px",
          transition: "border-color var(--dur-base) var(--ease-out), outline-color var(--dur-base) var(--ease-out)",
          ...inputStyle,
        }}
        {...rest}
      />
      {hint && (
        <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", color: invalid ? "var(--amber-600)" : "var(--text-muted)" }}>
          {hint}
        </span>
      )}
    </div>
  );
}
