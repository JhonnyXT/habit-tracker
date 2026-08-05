/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FDEDE5',
          100: '#FCDAC9',
          200: '#FBC09E',
          300: '#F9A06B',
          400: '#F3924A',
          500: '#E85D26',
          600: '#D14E1C',
          700: '#B24118',
          800: '#8C3313',
          900: '#6B270F',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F2F2F7',
          200: '#E2E2E6',
          300: '#C7C7CE',
          400: '#9B9BA3',
          500: '#6E6E76',
          600: '#4A4A50',
          700: '#2E2E33',
          800: '#1C1C1F',
          900: '#111113',
        },
        danger: {
          500: '#E5484D',
          600: '#F2555A',
        },
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
