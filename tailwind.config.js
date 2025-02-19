/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /ring-\[(?:#[0-9a-fA-F]{3,8})\]/,
    },
    {
      pattern: /border-\[(?:#[0-9a-fA-F]{3,8})\]/,
    },
    {
      pattern: /hover:border-2/,
    },
  ],
  theme: {
    extend: {
      colors: {
        'egg-yellow': '#FFF4D2',
        'deep-purple': '#4A3B52',
        'light-purple': '#635069',
        'soft-blue': '#7CB9E8',
      },
    },
  },
  plugins: [],
} 