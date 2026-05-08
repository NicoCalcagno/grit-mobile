/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './index.js',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        accent: '#00FF87',
        accent2: '#00D4A0',
        grit: {
          green: '#00FF87',
          teal: '#00D4A0',
          cyan: '#00BFA5',
          blue: '#1E88E5',
          purple: '#A855F7',
          red: '#EF5350',
          amber: '#FFB300',
        },
        surface: '#0C0C0C',
        elevated: '#141414',
        card: '#0F0F0F',
        muted: '#333333',
        sub: '#666666',
      },
    },
  },
  plugins: [],
};
