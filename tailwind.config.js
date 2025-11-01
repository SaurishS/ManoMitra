/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Frankfurter', 'sans-serif'],
      },
      colors: {
        'theme-beige': '#eadad1',
        // This is the dark text/button color you wanted
        'theme-text': '#4a4a4a',
        'theme-purple': '#e9d2eb', // <-- Try this new color
      },
      // We'll create a custom shadow for the button
      boxShadow: {
        'button-3d': '4px 4px 0px #000000',
      }
    },
  },
  plugins: [],
}