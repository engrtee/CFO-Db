/** @type {import('tailwindcss').Config} */
// Updated palette: Graphite / Burnt Peach / School Bus Yellow / Seashell
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lw: {
          /* ── Backgrounds ─────────────────────────── */
          navy:     '#292929',   /* graphite — main bg    */
          navyD:    '#1E1E1E',   /* deep graphite         */
          panel:    '#333333',   /* card surface          */

          /* ── Primary accent — Burnt Peach ─────── */
          red:      '#F27043',
          redD:     '#D85A30',

          /* ── Secondary accent — School Bus Yellow  */
          gold:     '#FEC43C',
          goldL:    '#FFD76B',

          /* ── Light / seashell surfaces ─────────── */
          bg:       '#FEEEE8',
          card:     '#FEECE6',
          card2:    '#FEEEE8',
          border:   '#E0C8BC',
          text:     '#292929',
          muted:    '#7A5E52',

          /* ── Semantic ──────────────────────────── */
          green:    '#00A86B',
          amber:    '#FEC43C',
          danger:   '#E55C3A',

          /* ── Dark-mode card surfaces ─────────── */
          darkCard:   '#333333',
          darkCard2:  '#3D3D3D',
          darkBorder: '#4A4A4A',
          darkText:   '#F5EDE8',   /* warm white */
          darkMuted:  '#A89080',   /* warm grey  */
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
