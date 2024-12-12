/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        base: ["Ubuntu", "serif"],
        base2: ["Shadows Into Light", "cursive"],
        base3: ["Arial","sans-serif"],
      },
    },
  },
  plugins: [],
};
