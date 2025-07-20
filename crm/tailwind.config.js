/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        primary: '#3F72AF',
        accent: '#F67280',
        card: '#FFFFFF',
        text: '#212121',
      },
    },
  },
  plugins: [],
} 