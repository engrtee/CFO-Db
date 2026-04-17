/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gt: {
          orange:  '#F58220',
          orangeD: '#D96E15',   // darker shade for hover
          black:   '#000000',
          dark:    '#0D0D0D',
          bg:      '#121212',
          card:    '#1E1E1E',
          card2:   '#272727',
          border:  '#333333',
          text:    '#FFFFFF',
          muted:   '#AAAAAA',
          amber:   '#FFA500',
          red:     '#E02020',
          green:   '#27AE60',
          grey:    '#F5F5F5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
