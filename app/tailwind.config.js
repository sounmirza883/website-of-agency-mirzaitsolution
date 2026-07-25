/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Brand red, shared with the website and client portal (--red).
        // Used for primary actions instead of black: black-on-black is invisible
        // in dark mode, whereas this reads correctly on both light and dark
        // backgrounds with white text, so no per-theme inversion is needed.
        brand: '#e63946',
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
