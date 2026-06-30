import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: "#0B2B22",
        },
        emerald: {
          50: "#EAF5EF",
          100: "#CFE8DA",
          200: "#9FD1B6",
          300: "#6FB991",
          400: "#3D9C6E",
          500: "#0F6B45",
          600: "#0C5938",
          700: "#0A4A30",
          800: "#073824",
          900: "#052618",
        },
        sand: {
          DEFAULT: "#FBF8F1",
          50: "#FFFFFF",
          100: "#FBF8F1",
          200: "#F4EEDD",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E8D9A8",
          deep: "#9C7A1B",
        },
      },
      fontFamily: {
        verse: ["var(--font-amiri)", "serif"],
        sans: ["var(--font-tajawal)", "Tahoma", "sans-serif"],
      },
      backgroundImage: {
        "islamic-pattern": "url('/patterns/star-tile.svg')",
      },
      boxShadow: {
        ornate: "0 10px 40px -12px rgba(10, 74, 48, 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out both",
        shimmer: "shimmer 3.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
