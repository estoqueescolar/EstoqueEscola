import { defineConfig, devices } from "@playwright/test";

// E2E + acessibilidade (axe) nas três larguras exigidas. Requer Supabase local com `npx supabase db reset`.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 60000,
  expect: { timeout: 15000 },
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  projects: [
    { name: "celular-375", use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 800 } } },
    { name: "tablet-768", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "desktop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
  ],
  webServer: { command: "npm run dev", url: "http://localhost:3000/login", reuseExistingServer: true, timeout: 120000 },
});
