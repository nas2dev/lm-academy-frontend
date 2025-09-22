/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Plus Jakarta Sans", "sans-serif"],
      gelasio: ["Gelasio", "serif"],
    },
    extend: {
      boxShadow: {
        sm: '0 0.5rem 1rem rgba(0,0,0,0.15)',
        md: "0px 2px 6px rgba(37,83,185,0.1)",
        xl: "inset 0 1px 2px rgba(90,106,133,0.075)",
      },
      colors: {
        textPrimary: '#333333',
        authBlue: "#0085DB"
      }

    },
    container: {
      center: true,
      padding: "20px",
    },
  },
  variants: {},
  plugins: [],
};