/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      colors: {
        temppay: {
          orange: '#F97316',
          'orange-hover': '#EA580C',
          'orange-light': '#FFF7ED',
          'orange-border': '#FED7AA',
          'orange-text': '#C05200',
          bg: '#F7F6F3',
          'card-border': '#EEEBE5',
          dark: '#0A0A0A',
          'strip-bg': '#F0EDE8',
          text: '#111111',
          'text-secondary': '#6B6B6B',
          muted: '#9B9B9B',
        },
      }
    },
  },
  plugins: [],
}
