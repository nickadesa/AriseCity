/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Silkscreen"', '"Press Start 2P"', 'monospace'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        ocean: {
          900: '#07162c',
          800: '#0d284f',
          700: '#144177',
          600: '#1e5da6',
          500: '#2b7cd3',
          400: '#4da0f0',
        },
        haven: {
          dark: '#181425',
          panel: '#262b44',
          border: '#3a4466',
          gold: '#fbb954',
          wood: '#63381a',
          leaf: '#3e8948',
        }
      },
      boxShadow: {
        'pixel': '3px 3px 0px 0px rgba(0,0,0,0.8)',
        'pixel-lg': '5px 5px 0px 0px rgba(0,0,0,0.85)',
      }
    },
  },
  plugins: [],
}
