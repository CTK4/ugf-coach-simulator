import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        panel: "#0b0f14",
        panel2: "#0f1620",
        ink: "#e6eef8",
        muted: "#9fb0c4",
        accent: "#ff6a00",
        line: "#223043",
        good: "#22c55e",
        warn: "#f59e0b",
        bad: "#ef4444",
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.35)"
      }
    },
  },
  plugins: [],
} satisfies Config;
