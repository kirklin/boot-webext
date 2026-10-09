import { defineConfig } from "@playwright/test";

// The tests load the production build from `.output/chrome-mv3`, which
// `pnpm test:e2e` builds before running them.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
});
