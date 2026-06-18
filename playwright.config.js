const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './playwright-tests',
  timeout: 30000,
  retries: 0,
  use: {
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: true,
    timeout: 20000,
    env: {
      DATABASE_URL: 'postgresql://kabianga_db_hl0s_user:Za7QvvmjrCTnxA7eulf7yfWOraywdXjZ@dpg-d8oiuaojs32c738dshn0-a.oregon-postgres.render.com/kabianga_db_hl0s',
      NODE_ENV: 'test',
    },
  },
});
