/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        page: '#F6EDED',
        bloom: '#FFF3F4',
        sakura: '#F8DDE3',
        blush: '#EFC2D0',
        ink: '#111111',
        muted: '#565052',
      },
      fontFamily: {
        display: ["'Clash Display'", 'system-ui', 'sans-serif'],
        heading: ["'Clash Display'", 'system-ui', 'sans-serif'],
        subheading: ["'Fredoka'", 'system-ui', 'sans-serif'],
        nav: ["'Fredoka'", 'system-ui', 'sans-serif'],
        fredoka: ["'Fredoka'", 'system-ui', 'sans-serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
