import type { BrowserContext } from "@playwright/test";
import type { AddressInfo } from "node:net";
import { createServer } from "node:http";
import path from "node:path";
import { test as base, chromium } from "@playwright/test";

const extensionPath = path.resolve(import.meta.dirname, "../.output/chrome-mv3");

export const test = base.extend<
  { context: BrowserContext; extensionId: string },
  { siteUrl: string }
>({
  // Pages for the content script to run on. `/<name>` serves a page titled "Page <name>",
  // and `/<name>?root-font-size=<px>` also changes the page's root font size.
  siteUrl: [async ({}, use) => {
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://localhost");
      const title = `Page ${url.pathname.slice(1)}`;
      const rootFontSize = url.searchParams.get("root-font-size");
      const style = rootFontSize ? `<style>html { font-size: ${Number(rootFontSize)}px }</style>` : "";
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(`<!doctype html><title>${title}</title>${style}<h1>${title}</h1>`);
    });
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

  extensionId: async ({ context }, use) => {
    const serviceWorker = context.serviceWorkers()[0] ?? await context.waitForEvent("serviceworker");
    await use(new URL(serviceWorker.url()).host);
  },
});

export const expect = test.expect;
