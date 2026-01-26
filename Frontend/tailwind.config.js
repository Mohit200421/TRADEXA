/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light theme colors
        light: {
          primary: '#3b82f6',
          secondary: '#10b981',
          accent: '#8b5cf6',
          background: '#f8fafc',
          surface: '#ffffff',
          text: '#1e293b',
          'text-secondary': '#64748b',
          border: '#e2e8f0',
          'border-light': '#f1f5f9',
        },
        // Dark theme colors
        dark: {
          primary: '#60a5fa',
          secondary: '#34d399',
          accent: '#a78bfa',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f1f5f9',
          'text-secondary': '#94a3b8',
          border: '#334155',
          'border-light': '#1e293b',
        }
      },
      animation: {
        'theme-switch': 'theme-switch 0.3s ease-in-out',
      },
      keyframes: {
        'theme-switch': {
          '0%': { opacity: 0, transform: 'scale(0.9)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}