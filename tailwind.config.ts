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
        "bg-subtle": "var(--bg-subtle)",
        panel: "var(--panel)",
        "border-light": "var(--border-light)",
        "text-main": "var(--text-main)",
        "text-muted": "var(--text-muted)",
        brand: "var(--brand)",
        "brand-light": "var(--brand-light)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
        floating: "0 10px 40px -10px rgba(15, 23, 42, 0.1)",
      }
    },
  },
  plugins: [],
};
export default config;
