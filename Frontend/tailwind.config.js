/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Core theme colors (CSS variables driven) */
        primary: "rgb(var(--color-primary))",
        secondary: "rgb(var(--color-secondary))",
        accent: "rgb(var(--color-accent))",

        background: "rgb(var(--color-background))",
        surface: "rgb(var(--color-surface))",

        text: "rgb(var(--color-text))",
        "text-secondary": "rgb(var(--color-text-secondary))",

        border: "rgb(var(--color-border))",
        "border-light": "rgb(var(--color-border-light))",
      },
    },
  },
  plugins: [],
};
