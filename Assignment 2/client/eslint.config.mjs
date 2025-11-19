import nextLint from "eslint-config-next/core-web-vitals";
import nextTS from "eslint-config-next/typescript";

const eslintConfig = defineConfig({
  ...nextLint,
  ...nextTS,

  rules: {
    "react-hooks/set-state-in-effect": "off",
  },

  // Override default ignores of eslint-config-next.
  ignores: [
    // Default ignores of eslint-config-next:
    "node_modules/",
    ".next/",
    "out/",
    "build/",
    "next-env.d.ts",
  ],
});

export default eslintConfig;
