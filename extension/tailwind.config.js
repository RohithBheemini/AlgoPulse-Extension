/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./popup.html"
  ],
  theme: {
    extend: {
      colors: {
        github: {
          canvas: '#0d1117',
          subtle: '#161b22',
          overlay: '#1f242c',
          muted: '#21262d',
          border: '#30363d',
          borderMuted: '#21262d',
          borderActive: '#8b949e',
          text: '#c9d1d9',
          textBright: '#f0f6fc',
          textMuted: '#8b949e',
          textSubtle: '#6e7681',
        },
        google: {
          blue: '#4285F4',
          'blue-hover': '#3367D6',
          'blue-subtle': 'rgba(66, 133, 244, 0.12)',
          red: '#EA4335',
          'red-hover': '#D93025',
          'red-subtle': 'rgba(234, 67, 53, 0.12)',
          yellow: '#FBBC05',
          'yellow-hover': '#F29900',
          'yellow-subtle': 'rgba(251, 188, 5, 0.12)',
          green: '#34A853',
          'green-hover': '#1E8E3E',
          'green-subtle': 'rgba(52, 168, 83, 0.12)',
        },
        brand: {
          50: '#e8f0fe',
          100: '#d2e3fc',
          500: '#4285F4',
          600: '#3367D6',
          700: '#1a73e8',
          900: '#174ea6',
        }
      }
    },
  },
  plugins: [],
}
