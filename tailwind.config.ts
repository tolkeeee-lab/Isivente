import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-syne)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Néo-Brutalisme Colors
        brutal: {
          bg: "#FF5E00", // Takeboost-style intense orange
          bg2: "#FFB800", // Yellow gradient
          dark: "#0F0F0F",
          light: "#FFFFFF",
          accent: "#CCFF00", // Neon lime
          purple: "#9D00FF", // Intense purple
        }
      },
      boxShadow: {
        'brutal': '8px 8px 0px 0px rgba(15,15,15,1)',
        'brutal-lg': '12px 12px 0px 0px rgba(15,15,15,1)',
        'brutal-hover': '4px 4px 0px 0px rgba(15,15,15,1)',
      }
    },
  },
  plugins: [],
};
export default config;
