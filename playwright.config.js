import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const chromiumPath = process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:4173', browserName: 'chromium', launchOptions: { executablePath: chromiumPath, args: ['--no-sandbox'] }, reducedMotion: 'reduce' },
  webServer: { command: 'npm start', env: { PORT: '4173', BASEROW_TOKEN: '', BASEROW_TABLE_ID: '', VITE_CONTACT_ENDPOINT: '', VITE_SIGNUP_ENDPOINT: '' }, url: 'http://127.0.0.1:4173/api/health', reuseExistingServer: !process.env.CI },
});
