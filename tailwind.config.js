/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lw: {
          navy:    '#0A1628',
          navyD:   '#06101C',
          panel:   '#0F1E35',
          red:     '#C8102E',
          redD:    '#A50D26',
          gold:    '#C9A84C',
          goldL:   '#E2C97A',
          bg:      '#F4F6FA',
          card:    '#FFFFFF',
          card2:   '#F4F6FA',
          border:  '#E2E5EA',
          text:    '#111827',
          muted:   '#6B7280',
          green:   '#00A86B',
          amber:   '#F59E0B',
          danger:  '#DC2626',
          // dark-mode card surfaces
          darkCard:  '#132035',
          darkCard2: '#1A2D47',
          darkBorder:'#243654',
          darkText:  '#E8EDF5',
          darkMuted: '#7A92B0',
        },
      },
      fontFamily: {
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono:  ['IBM Plex Mono', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'counter':    'counterUp 0.8s ease-out forwards',
        'fade-in':    'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
