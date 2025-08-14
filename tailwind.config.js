/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/*.{js,ts,jsx,tsx}",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [require("tailwindcss-animate")],
};
