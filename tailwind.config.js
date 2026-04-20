/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#0F4CFF',
          600: '#0033CC',
          700: '#002299',
        },
        accent: '#00D4FF',
        gold:   '#F5B301',
        surface: {
          DEFAULT: '#0F1629',
          2: '#111E35',
          3: '#162040',
        },
        ink: {
          DEFAULT: '#080D1A',
          2: '#050810',
        },
        muted: '#4A6080',
        'mtn-yellow': '#FFCC00',
        'orange-money': '#FF6600',
      },
      fontFamily: {
        display: ["'Syne'", 'sans-serif'],
        body:    ["'DM Sans'", 'sans-serif'],
        mono:    ["'JetBrains Mono'", 'monospace'],
      },
      backgroundImage: {
        'grid-dots': 'radial-gradient(circle, rgba(15,76,255,0.07) 1px, transparent 1px)',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(15,76,255,0.3) 0%, transparent 60%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)',
      },
      animation: {
        'fade-up':     'fadeUp 0.5s ease forwards',
        'fade-in':     'fadeIn 0.4s ease forwards',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'float':       'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
    },
  },
  plugins: [],
}
