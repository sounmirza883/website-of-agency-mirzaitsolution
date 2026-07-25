/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        text: { DEFAULT: '#000000', dark: '#ffffff' },
        surface: { DEFAULT: '#ffffff', dark: '#000000' },
        'surface-element': { DEFAULT: '#F0F0F3', dark: '#212225' },
        'surface-selected': { DEFAULT: '#E0E1E6', dark: '#2E3135' },
        'text-secondary': { DEFAULT: '#60646C', dark: '#B0B4BA' },
      },
    },
  },
  plugins: [],
};
