/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ff6600", // Plusway orange
        secondary: "#222222",
        accent: "#00b100", // Plusway green
      },
    },
  },
  plugins: [],
};
