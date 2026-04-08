/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          green: '#10b981',
          blue: '#3b82f6',
          violet: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          cyan: '#06b6d4',
        }
      }
    },
  },
  plugins: [],
};
