module.exports = {
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  rules: {
    semi: "warn",
    "no-unused-vars": "warn",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: "true",
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
};
