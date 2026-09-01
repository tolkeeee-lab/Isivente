import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        "panel-line": "var(--panel-line)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        purple: "var(--purple)",
        "purple-deep": "var(--purple-deep)",
        magenta: "var(--magenta)",
        "magenta-deep": "var(--magenta-deep)",
        mint: "var(--mint)",
        "mint-deep": "var(--mint-deep)",
        cream: "var(--cream)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        sticker: "0 10px 24px -8px rgba(0,0,0,0.3)",
      }
    },
  },
  plugins: [],
};
export default config;

