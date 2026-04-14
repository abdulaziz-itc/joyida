/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020205",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#8b5cf6",
          hover: "#7c3aed",
          glow: "rgba(139, 92, 246, 0.4)",
        },
        secondary: "#ec4899",
        accent: "#00d2ff",
      },
      fontFamily: {
        main: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'premium': '0 20px 50px rgba(0, 0, 0, 0.5)',
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
