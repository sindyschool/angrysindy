/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      animation: {
        'ping-fast': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
} 