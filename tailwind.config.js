/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          accent: '#10b981',
        },
        dark: {
          bg: '#090d16',
          card: '#111827',
          surface: '#182234',
          border: '#1f2d42',
          subtext: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Prompt', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
