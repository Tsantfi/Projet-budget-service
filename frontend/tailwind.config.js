/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        haigana: {
          bg: "#E8EDF2",      // fond clair
          dark: "#2C3947",    // navbar / textes forts
          blue: "#547A95",    // accent principal
          gold: "#C2A56D",    // accent secondaire / CTA
        }
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      boxShadow: {
        card: "0 4px 20px rgba(44, 57, 71, 0.08)",
      },

      // ANIMATIONS
      keyframes: {
        fadeUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(18px)",
          },

          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },

      animation: {
        fadeUp: "fadeUp 0.7s ease-out forwards",
      },
    },
  },

  plugins: [],
};