/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Nunito", "ui-sans-serif", "system-ui", "sans-serif"] },
      colors: {
        brand: { 50: "#F5F3FF", 100: "#EDE9FE", 200: "#DDD6FE", 300: "#C4B5FD", 500: "#8B5CF6", 600: "#7C3AED", 700: "#6D28D9", 800: "#5B21B6" },
        ok: { 50: "#F0FDF4", 100: "#DCFCE7", 500: "#22C55E", 600: "#16A34A", 700: "#15803D" },
        bad: { 50: "#FEF2F2", 100: "#FEE2E2", 500: "#EF4444", 600: "#DC2626", 700: "#B91C1C" },
        flame: { 100: "#FFEDD5", 500: "#F97316", 600: "#EA580C" },
        ink: "#1C1917",
        paper: "#FAFAF9",
      },
      boxShadow: {
        btn: "0 4px 0 0 rgba(0,0,0,0.15)",
        card: "0 1px 2px rgba(28,25,23,0.04), 0 4px 16px rgba(28,25,23,0.06)",
      },
    },
  },
  plugins: [],
};
