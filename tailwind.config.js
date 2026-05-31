/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./assets/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'arch-bg': '#0a0a0a',
        'arch-surface': '#141414',
        'arch-accent': '#c28e5e',
        'arch-text': '#e5e5e5',
        'arch-muted': '#888888'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      spacing: {
        '128': '32rem',
      }
    }
  },
  plugins: [],
}