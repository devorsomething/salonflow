import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f6f7f4",
          100: "#e8ebe3",
          200: "#d4dac9",
          300: "#b5c0a4",
          400: "#96a67e",
          500: "#788c5c",
          600: "#5e7047",
          700: "#4b5939",
          800: "#3e4832",
          900: "#353d2c",
          950: "#1d2117",
        },
        sand: {
          50: "#f9f7f3",
          100: "#f1ede3",
          200: "#e4dcc8",
          300: "#d4c5a6",
          400: "#c4ab82",
          500: "#b89662",
          600: "#a87f4d",
          700: "#8b6740",
          800: "#715338",
          900: "#5d452f",
          950: "#322419",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
