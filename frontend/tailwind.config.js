/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#1a1a2e',
        'brand-darker': '#16213e',
        'brand-light': '#e94560',
        'brand-violet': '#7f5af0',
        'brand-purple': '#6b4eda',
        'brand-pink': '#ff8eaf',
        'brand-cyan': '#2cb67d',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}