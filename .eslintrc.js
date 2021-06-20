module.exports = {
  env: {
    es6: true,
    node: true,
    'jest/globals': true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier/@typescript-eslint',

  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier', 'jest'],
  rules: {
    'no-unused-vars': ['error'],
    'linebreak-style': ['error', 'unix'],
    'prettier/prettier': 'error',
    'require-await': ['error'],
  },
}
