import localFont from "next/font/local"

export const interTight = localFont({
  src: "../app/fonts/InterTight-VariableFont_wght.ttf",
  weight: "100 900",
  variable: "--font-inter-tight",
  display: "swap",
})

export const instrumentSerif = localFont({
  src: [
    {
      path: "../app/fonts/InstrumentSerif-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../app/fonts/InstrumentSerif-Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const nothingYouCouldDo = localFont({
  src: "../app/fonts/NothingYouCouldDo-Regular.ttf",
  weight: "400",
  variable: "--font-handwriting",
  display: "swap",
})
