/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        // Brand accent, shared with the website and client portal (--accent).
        // Used for primary actions instead of black: black-on-black is invisible
        // in dark mode, whereas this reads correctly on both light and dark
        // backgrounds with cream text, so no per-theme inversion is needed.
        brand: '#c67139',
        'brand-2': '#7a8a5e',
        text: { DEFAULT: '#201e1d', dark: '#f5ead8' },
        surface: { DEFAULT: '#f5ead8', dark: '#2e2b25' },
        'surface-element': { DEFAULT: '#eee7db', dark: '#3d372e' },
        'surface-selected': { DEFAULT: '#dcd3c4', dark: '#474238' },
        'text-secondary': { DEFAULT: '#645c50', dark: '#a19786' },
      },
      fontFamily: {
        // Registered via useFonts() in src/app/_layout.tsx (native) / the
        // --font-display CSS var in src/global.css (web) - use font-sans /
        // font-heading classNames to opt individual Text elements in, since
        // React Native does not cascade fontFamily the way CSS does.
        sans: ['Figtree_400Regular'],
        heading: ['Caprasimo_400Regular'],
      },
    },
  },
  plugins: [],
};
