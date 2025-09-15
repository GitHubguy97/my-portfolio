/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        elev: '0 16px 40px rgba(0,0,0,.45), 0 6px 12px rgba(0,0,0,.25)',
        elevHover: '0 22px 52px rgba(0,0,0,.5)',
      },
      colors: {
        border: 'rgba(255,255,255,0.10)',
      },
      borderRadius: {
        xl2: '18px',
      },
    },
  },
  plugins: [],
};
