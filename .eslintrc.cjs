/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'vue/script-setup-uses-vars': 'error',
    'no-unused-vars': 'warn',
    'prettier/prettier': [
      'warn',
      {
        semi: false,
        singleQuote: true,
      },
    ],
  },
}
