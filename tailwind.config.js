/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // override Tailwind's red palette so that all `red-*` utilities
        // are based on the brand logo color (#DF5622).  Only a few
        // shades are customized here; the rest fall back to the default
        // spectrum so existing classes continue to work as expected.
        red: {
          50: '#ffece9',
          100: '#ffd7d2',
          200: '#ffb1a5',
          300: '#ff8b78',
          400: '#ff6550',
          500: '#ff3f28',
          600: '#DF5622', // base logo color
          700: '#b9451a',
          800: '#923412',
          900: '#6d230b',
        },
      },
    },
  },
  plugins: [],
};
