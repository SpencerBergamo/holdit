// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',

      // Ignore Deno Import Errors
      "import/no-unresolved": ["error", { "ignore": ["^npm:"] }],
    },
  },
]);
