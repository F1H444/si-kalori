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
        background: "#FFFFFF",
        foreground: "#000000",
        primary: {
          DEFAULT: "#FFDE59", // Brand Yellow
          hover: "#FFC700",
        },
        secondary: {
          DEFAULT: "#2563EB", // Brand Blue
          hover: "#1D4ED8",
        },
        accent: {
          green: "#22C55E",
          red: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["var(--font-lexend)"],
        mono: ["var(--font-geist-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
