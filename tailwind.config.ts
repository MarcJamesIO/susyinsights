/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        susyLightBlue: "#F4F5FD", // Define your custom color here
        susyBlue: "#353EA4",
        susyPink: "#FF8080",
        susyLightPink: "#ff938c",
        susyNavy: "#1A1F60",
        susyGreen: "#37CDA0",
        keyA: "#FFF2F2",
        keyB: "#F6E3F2",
        keyC: "#C9C2E4",
        keyD: "#5D61B6",
        keyE: "#353EA4",
        keyF: "#202562",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },

      fontFamily: {
        SusyFont: ["SusyFont", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar")],
};
