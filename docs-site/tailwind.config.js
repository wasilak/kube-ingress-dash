/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
    './src/components/**/*.{js,jsx,ts,tsx}',
    './src/theme/**/*.{js,jsx,ts,tsx}',
    './blog/**/*.{md,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};