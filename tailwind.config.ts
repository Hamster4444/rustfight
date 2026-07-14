import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0c",
        surface: "#141317",
        surface2: "#1b1a20",
        edge: "#26232c",
        accent: {
          DEFAULT: "#8b5cf6",
          hover: "#9b6ef8",
          deep: "#6d28d9",
        },
        rarity: {
          consumer: "#b0b3b8",
          industrial: "#3b82f6",
          restricted: "#a855f7",
          classified: "#ec4899",
          covert: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-rajdhani)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
