import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"],
    languageOptions: { 
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2021
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Show unused variables as warnings
      'no-unused-vars': ['warn', { 'args': 'none', 'ignoreRestSiblings': true }],
      // You can add more rules here as needed
    }
  }
]);
