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
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Outfit", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "monospace"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        premium: {
          bg: "#F8FAFC",
          bg2: "#F1F5F9",
          dark: "#0F172A",
          light: "#FFFFFF",
          accent: "#6366F1",
        },
      },
      boxShadow: {
        "premium": "0 20px 40px -15px rgba(0,0,0,0.05)",
        "premium-hover": "0 30px 60px -15px rgba(99, 102, 241, 0.12)",
        "xs": "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
        "bevel-light": "inset 0 1px 0 0 rgba(255,255,255,0.9), 0 1px 3px 0 rgba(0,0,0,0.04), 0 6px 16px -4px rgba(0,0,0,0.04)",
        "bevel-dark": "inset 0 1px 0 0 rgba(255,255,255,0.08), 0 1px 3px 0 rgba(0,0,0,0.3), 0 8px 24px -4px rgba(0,0,0,0.4)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      keyframes: {
        staggerFadeUp: {
          from: {
            opacity: "0",
            transform: "translateY(10px) scale(0.99)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.02)" },
        },
      },
      animation: {
        "stagger-item": "staggerFadeUp 220ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "shimmer": "shimmer 1.5s infinite",
        "marquee": "marquee 20s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.16, 1, 0.3, 1)",
        "press": "cubic-bezier(0.2, 0, 0, 1)",
        "sheet": "cubic-bezier(0.32, 0.72, 0, 1)",
        "exit": "cubic-bezier(0.4, 0, 1, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
