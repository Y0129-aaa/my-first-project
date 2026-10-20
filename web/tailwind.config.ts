import type { Config } from "tailwindcss";

const config: Config = {
  // 告诉 Tailwind 去哪些文件里找用到的类名
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
