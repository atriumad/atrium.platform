/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
      },
      colors: {
        rg: {
          ink: "#0d2f33",
          body: "#3f544f",
          muted: "#78877f",
          /* the loading stage runs a lighter muted than the report */
          "muted-soft": "#93a09b",
          dark: "#0d353b",
          green: "#1f7a52",
          mint: "#a9edc8",
          amber: "#f3c150",
          "green-fill": "#3fae78",
          "green-soft": "#e3f2e9",
          "green-ink": "#186043",
          "amber-fill": "#eab63f",
          "amber-soft": "#f9ecc7",
          "amber-ink": "#a97f1c",
          "red-fill": "#e08a5b",
          "red-soft": "#f7e2d6",
          "red-ink": "#c0653a",
          "red-tint": "#f0b79b",
          error: "#b4553a",
          track: "#ece8da",
          "track-soft": "#e9e5d7",
          pending: "#c7cec9",
          card: "#fff",
          border: "rgba(13,47,51,.10)",
          surface: "#f4f1e7",
          "surface-soft": "#faf8f0",
        },
      },
      borderRadius: {
        rg: "26px",
        "rg-sm": "18px",
      },
      boxShadow: {
        rg: "0 1px 0 rgba(13,47,51,.04), 0 16px 40px rgba(13,47,51,.07)",
        "rg-h": "0 2px 0 rgba(13,47,51,.04), 0 28px 56px rgba(13,47,51,.11)",
        "rg-search-h": "0 2px 0 rgba(13,47,51,.04), 0 26px 54px rgba(13,47,51,.12)",
        "rg-loading": "0 1px 0 rgba(13,47,51,.04), 0 18px 44px rgba(13,47,51,.08)",
      },
      transitionTimingFunction: {
        rg: "cubic-bezier(.2,.7,.2,1)",
      },
      keyframes: {
        "stage-rise": {
          from: { opacity: "0", filter: "blur(8px)", transform: "translate3d(0, 20px, 0) scale(0.988)" },
          to: { opacity: "1", filter: "blur(0)", transform: "translate3d(0, 0, 0) scale(1)" },
        },
        "rg-fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "none" },
        },
        "rg-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".35" },
        },
        "rgl-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".3" },
        },
        "rgl-spin": {
          to: { transform: "rotate(360deg)" },
        },
        "rgl-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "stage-rise": "stage-rise 900ms cubic-bezier(0.19, 1, 0.22, 1) both",
        "rg-up": "rg-fade-up .7s cubic-bezier(.2,.7,.2,1) both",
        "rg-up-form": "rg-fade-up .7s cubic-bezier(.2,.7,.2,1) .08s both",
        "rg-up-trust": "rg-fade-up .6s cubic-bezier(.2,.7,.2,1) .18s both",
        "rg-up-fast": "rg-fade-up .5s cubic-bezier(.2,.7,.2,1) both",
        "rg-pulse": "rg-pulse 2s infinite",
        "rgl-pulse": "rgl-pulse 1.6s infinite",
        "rgl-spin": "rgl-spin .8s linear infinite",
        "rgl-fade-in": "rgl-fade-in .3s cubic-bezier(.2,.7,.2,1) both",
      },
    },
  },
  plugins: [],
}
