/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./web/index.html",
    "./web/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      colors: {
        'retro': {
          'dark': '#0a0e27',
          'darker': '#050814',
          'purple': '#8b5cf6',
          'pink': '#ec4899',
          'cyan': '#06b6d4',
          'green': '#10b981',
          'yellow': '#fbbf24',
          'orange': '#f97316',
          'blue': '#3b82f6',
        },
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'neon-pink': '0 0 20px rgba(236, 72, 153, 0.5)',
        'neon-cyan': '0 0 20px rgba(6, 182, 212, 0.5)',
        'neon-green': '0 0 20px rgba(16, 185, 129, 0.5)',
      },
    },
  },
  plugins: [],
}
