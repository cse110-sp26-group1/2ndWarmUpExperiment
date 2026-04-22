const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: "test.spec.js",
  timeout: 30000,
  use: {
    headless: true
  }
});
