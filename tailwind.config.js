/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6F00',
        secondary: '#FFB74D',
        surface: '#1E1E1E',
        background: '#121212',
        'surface-lighter': '#2C2C2C',
      }
    },
  },
  plugins: [],
}

