/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        pixel: ['"Silkscreen"', '"Press Start 2P"', 'monospace'],
      },
      colors: {
        studio: {
          darkest: '#0b0d10',
          dark: '#12151a',
          card: '#181c22',
          border: '#2a313d',
          muted: '#8b949e',
        },
        catch: {
          yellow: '#facc15',
          gold: '#eab308',
          light: '#fef08a',
          dark: '#ca8a04',
        },
        emerald: {
          accent: '#10b981',
          dark: '#047857',
        }
      },
      boxShadow: {
        'glow-yellow': '0 0 15px rgba(250, 204, 21, 0.35)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.35)',
        'modal': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}
