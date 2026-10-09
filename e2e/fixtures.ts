import type { BrowserContext, Worker } from "@playwright/test";
import type { AddressInfo } from "node:net";
import { createServer } from "node:http";
import path from "node:path";
import { test as base, chromium } from "@playwright/test";
import { handleSiteRequest } from "./site";

const extensionPath = path.resolve(import.meta.dirname, "../.output/chrome-mv3");

export const test = base.extend<
  { context: BrowserContext; serviceWorker: Worker; extensionId: string },
  { siteUrl: string }
>({
  // A local site for the content scripts to run on, see `site.ts`.
  siteUrl: [async ({}, use) => {
    const server = createServer(handleSiteRequest);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    await use(`http://127.0.0.1:${port}`);
    await new Promise(resolve => server.close(resolve));
  }, { scope: "worker" }],

  // Extensions only load into a persistent context, and the `chromium` channel runs them headless.
  context: async ({ colorScheme }, use) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      colorScheme,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    await use(context);
    await context.close();
  },

  serviceWorker: async ({ context }, use) => {
    await use(context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker"));
  },

  extensionId: async ({ serviceWorker }, use) => {
    await use(new URL(serviceWorker.url()).host);
  },
});

export const expect = test.expect;
