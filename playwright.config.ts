import { defineConfig, devices } from "@playwright/test";
import { delimiter, join } from "node:path";

// Playwright uses taskkill to stop its local server on Windows. Some terminal
// environments omit System32 from PATH even though taskkill is installed.
if (process.platform === "win32") {
  const systemDirectory = join(process.env.SystemRoot ?? "C:\\Windows", "System32");
  process.env.PATH = [systemDirectory, process.env.PATH ?? ""].join(delimiter);
}

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: {
    command: "node scripts/preview.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
