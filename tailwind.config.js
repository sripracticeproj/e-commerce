/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        slideOver: "slideOver 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        scaleUp: "scaleUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
}
