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
        premium: {
          bg: "#FAF9F6", // Off-white luxury
          bg2: "#F3E8FF", // Soft lavender
          dark: "#1A1A1A", // Off-black
          light: "#FFFFFF",
          accent: "#9333EA", // Elegant purple
        }
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0,0,0,0.05)',
        'premium-hover': '0 30px 60px -15px rgba(147, 51, 234, 0.15)',
      }
    },
  },
  plugins: [],
};
export default config;
