/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#1F2547',
          50: '#F5F7FC',
          100: '#E9ECF8',
          200: '#D2D9F2',
          600: '#2C3565',
          700: '#252C55',
          800: '#1F2547',
          900: '#151A33',
          950: '#0B0F20',
        },
        safety: {
          DEFAULT: '#FFC22E',
          50: '#FFFDF0',
          100: '#FFF9D6',
          200: '#FFF0A8',
          300: '#FFE57A',
          400: '#FFD74C',
          500: '#FFC22E',
          600: '#E6A714',
          700: '#B8820B',
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(31, 37, 71, 0.08)',
        'card': '0 2px 10px rgba(31, 37, 71, 0.06)',
        'floating': '0 8px 30px rgb(0, 0, 0, 0.04)',
        'floating-lg': '0 16px 40px rgb(0, 0, 0, 0.08)',
        'passport': '0 20px 50px -10px rgba(15, 23, 42, 0.35)',
        'yellow-glow': '0 8px 24px -4px rgba(255, 194, 46, 0.45)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
