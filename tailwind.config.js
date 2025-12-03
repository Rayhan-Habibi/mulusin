/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")], // Ini wajib ada biar DaisyUI jalan

  // 👇 INI KUNCI BIAR GA WASHOUT
  daisyui: {
    themes: ["corporate", "light"], // Memaksa pakai tema 'corporate' (tema admin profesional)
  },
}