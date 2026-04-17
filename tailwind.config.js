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
          dark:    '#1A1A1A',
          bg:      '#F4F5F7',   // light page background
          card:    '#FFFFFF',   // white cards
          card2:   '#F9FAFB',   // slightly off-white secondary
          border:  '#E2E5EA',   // light border
          text:    '#111827',   // near-black body text
          muted:   '#6B7280',   // grey muted text
          amber:   '#D97706',   // amber (darker for light bg)
          red:     '#DC2626',   // red
          green:   '#16A34A',   // green
          grey:    '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
