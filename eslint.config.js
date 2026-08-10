// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // See docs/decisions/ADR-009.md.
    rules: {
      "react-hooks/immutability": "off",
    },
  },
]);
