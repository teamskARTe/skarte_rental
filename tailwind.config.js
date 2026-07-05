/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      screens: { xs: '420px' },
      fontFamily: {
        sans: ['Pretendard', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['Pretendard', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
