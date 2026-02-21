import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["src/**/*.{astro,ts,tsx,js,mjs,cjs}"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["api/**/*.{ts,js,mjs,cjs}", "scripts/**/*.{ts,js,mjs,cjs}", "astro.config.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },
);
