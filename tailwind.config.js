/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F4F1EA",
        surface: "#FBF9F4",
        ink: "#23211C",
        muted: "#5C574C",
        line: "#DED8C9",
        navy: {
          DEFAULT: "#1F3354",
          deep: "#16233B",
          soft: "#33476B",
        },
        seal: "#9A7B3F",
      },
      fontFamily: {
        serif: ['"Hoefler Text"', '"Baskerville"', 'Georgia', '"Times New Roman"', "serif"],
        sans: ['"Poppins"', 'sans-serif'],
        poppins: ['"Poppins"', 'sans-serif'],
      },
      borderRadius: {
        soft: "3px",
      },
    },
  },
  plugins: [],
};
