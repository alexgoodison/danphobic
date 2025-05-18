import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "ul > li::before": {
              content: '""',
              width: "0.5em",
              height: "0.125em",
              marginTop: "0.875em",
              marginRight: "0.5em",
              backgroundColor: "currentColor",
              display: "inline-block",
              verticalAlign: "top",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
