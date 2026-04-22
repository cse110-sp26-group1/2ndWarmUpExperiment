module.exports = [
  {
    files: ["*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        document: "readonly",
        module: "readonly",
        require: "readonly",
        window: "readonly"
      }
    },
    rules: {
      "no-console": "off",
      "no-unused-vars": ["error", { args: "none", caughtErrors: "all", caughtErrorsIgnorePattern: "^_" }]
    }
  }
];
