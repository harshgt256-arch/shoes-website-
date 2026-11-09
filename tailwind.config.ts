import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-primary)",
        "background-secondary": "var(--bg-secondary)",
        foreground: "var(--text-primary)",
        "foreground-secondary": "var(--text-secondary)",
        "foreground-muted": "var(--text-muted)",
        accent: {
          red: "var(--accent-red)",
          "red-hover": "var(--accent-red-hover)",
          "red-subtle": "var(--accent-red-subtle)",
        },
        border: {
          DEFAULT: "var(--border-subtle)",
          strong: "var(--border-strong)",
        },
      },
      fontFamily: {
        headline: ["var(--font-headline)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        editorial: "0.18em",
        "editorial-wide": "0.28em",
        "editorial-tight": "0.04em",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.19, 1, 0.22, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
