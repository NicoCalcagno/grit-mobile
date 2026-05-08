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
        orange: '#FF5722',
        gold: '#FFB300',
        grit: {
          orange: '#FF5722',
          gold: '#FFB300',
          cyan: '#00BCD4',
          purple: '#9C27B0',
          teal: '#00897B',
          green: '#43A047',
          blue: '#1E88E5',
          red: '#EF5350',
        },
        surface: '#0C0C0C',
        elevated: '#141414',
        card: '#0F0F0F',
        muted: '#444444',
        sub: '#888888',
      },
      fontWeight: {
        black: '900',
      },
    },
  },
  plugins: [],
};
