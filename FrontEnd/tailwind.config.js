/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', //for darkMode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      boxShadow: {
        'map': '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      },
      transitionProperty: {
        'scale': 'scale',
        'shadow': 'box-shadow'
      }
    }
  },
  plugins: [],
}
