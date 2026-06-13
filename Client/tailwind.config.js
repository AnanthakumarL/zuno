/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Monochrome scale (kept under the `olive` key so existing utility
        // classes map straight to the new near-black palette).
        olive: {
          50:  '#f6f6f6',
          100: '#ededed',
          200: '#e0e0e0',
          300: '#c7c7c7',
          400: '#9e9e9e',
          500: '#6f6f6f',
          600: '#404040',
          700: '#1f1f1f',
          800: '#171717',
          900: '#0f0f0f',
          950: '#0a0a0a',
        },
        cream: '#FFFFFF',
        parchment: '#F5F5F4',
      },
      fontFamily: {
        display: ['Archivo', 'Inter', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'Inter', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-18px)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float:           'float 5s ease-in-out infinite',
        'float-delay':   'float 5s ease-in-out 1.5s infinite',
        'slide-in-right':'slide-in-right 0.35s ease-out',
        'fade-up':       'fade-up 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
