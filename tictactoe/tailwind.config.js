/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pastel: {
          bg: "#fdf8fa",
          card: "#ffffff",
          pink: "#f472b6",
          pinkLight: "#fdf2f8",
          pinkBorder: "#fbcfe8",
          purple: "#c084fc",
          purpleLight: "#faf5ff",
          purpleBorder: "#e9d5ff",
          blue: "#38bdf8",
          blueLight: "#f0f9ff",
          blueBorder: "#bae6fd",
          green: "#34d399",
          greenLight: "#ecfdf5",
          greenBorder: "#a7f3d0",
          yellow: "#fbbf24",
          yellowLight: "#fffbeb",
          yellowBorder: "#fde68a",
          coral: "#fb7185",
          coralLight: "#fff1f2",
          coralBorder: "#fecdd3",
        },
      },
      fontFamily: {
        sans: ["Quicksand", "Comfortaa", "Outfit", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        pillowy: "0 10px 30px -5px rgba(236, 72, 153, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        "pillowy-hover": "0 15px 35px -5px rgba(236, 72, 153, 0.15), 0 8px 16px -2px rgba(0, 0, 0, 0.05)",
        tactile: "0 6px 0 0 rgba(0, 0, 0, 0.08)",
      },
      animation: {
        "pop-bounce": "popBounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "soft-float": "softFloat 3s ease-in-out infinite",
        "fade-in": "fadeIn 0.25s ease-out forwards",
        "zoom-in": "zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        wiggle: "wiggle 1.2s ease-in-out infinite",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        popBounce: {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "80%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
        softFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        zoomIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(0.98)" },
        },
      },
    },
  },
  plugins: [],
};
