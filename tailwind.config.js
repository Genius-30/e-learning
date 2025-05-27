import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {}, // Don't override Hero UI defaults
  },
  darkMode: "class",
  plugins: [heroui()], // Use the Hero UI plugin
  corePlugins: {
    preflight: false, // This prevents Tailwind from resetting Hero UI styles
  },
};

export default config;
