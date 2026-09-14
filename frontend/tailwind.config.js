/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f0ff',
          100: '#e6e1ff',
          200: '#c9bdff',
          300: '#a996ff',
          400: '#8b6bff',
          500: '#6d3bff',
          600: '#5a1feb',
          700: '#4816c2',
          800: '#37129a',
          900: '#280d70',
        },
        accent: {
          400: '#ff7a59',
          500: '#ff5c33',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 24px -4px rgba(60, 30, 130, 0.12)',
        cardDark: '0 4px 24px -4px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
