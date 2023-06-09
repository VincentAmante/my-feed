import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["dark", {
      soft: {
        "primary": "#67e8f9",
        "secondary": "#f0abfc",
        "accent": "#fca5a5",
        "neutral": "#231a2d",
        "base-100": "#e7e5e4",
        "info": "#89d5f5",
        "success": "#34d399",
        "warning": "#fb923c",
        "error": "#f43f5e",
      },

    }],
  },
  plugins: [require("daisyui")],
} satisfies Config;