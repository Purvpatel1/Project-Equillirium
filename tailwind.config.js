/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: '#F7F8F4',
          surface: '#EEF1E8',
          olive: '#6B7D5C',
          sage: '#A3B18A',
          text: '#2F2F2F',
          muted: '#5F5F5F'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        display: ['"Playfair Display"', 'serif'],
      }
    },
  },
  plugins: [],
}
