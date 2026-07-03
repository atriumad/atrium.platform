import React from "react";

const MARK = "atrium-mark.svg";
const WORDMARK = "atrium-wordmark.svg";

/**
 * Atrium Logo — α monogram, wordmark, or horizontal lockup.
 * Recolors via CSS mask, so `color` accepts any brand token / hex.
 * `assetBase` points at the folder holding the logo SVGs (default
 * resolves the kit's own assets/logos via a relative path).
 */
export function Logo({
  variant = "wordmark",
  color = "var(--teal-800)",
  height = 32,
  assetBase = "../../assets/logos",
  gap = 14,
  style = {},
  ...rest
}) {
  const mask = (file, ratio) => ({
    display: "block",
    height: `${height}px`,
    width: `${height * ratio}px`,
    background: color,
    WebkitMask: `url(${assetBase}/${file}) left center / contain no-repeat`,
    mask: `url(${assetBase}/${file}) left center / contain no-repeat`,
  });

  if (variant === "mark") {
    return <span role="img" aria-label="Atrium" style={{ ...mask(MARK, 1), ...style }} {...rest} />;
  }
  if (variant === "wordmark") {
    return <span role="img" aria-label="atrium" style={{ ...mask(WORDMARK, 819.21 / 225.63), ...style }} {...rest} />;
  }
  // lockup: mark + wordmark
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: `${gap}px`, ...style }} aria-label="Atrium" role="img" {...rest}>
      <span style={mask(MARK, 1)} />
      <span style={mask(WORDMARK, 819.21 / 225.63)} />
    </span>
  );
}
