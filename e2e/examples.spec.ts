import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// The extension APIs the tests call inside the service worker with `serviceWorker.evaluate`.
interface ServiceWorkerChrome {
  tabs: {
    query: (queryInfo: { url?: string }) => Promise<{ id?: number }[]>;
    sendMessage: (tabId: number, message: unknown) => Promise<unknown>;
  };
  action: { getBadgeText: (details: { tabId: number }) => Promise<string> };
  commands: { getAll: () => Promise<{ name?: string; description?: string; shortcut?: string }[]> };
  storage: { session: { set: (items: Record<string, unknown>) => Promise<void> } };
}

function pageKeydowns(page: Page) {
  return page.evaluate(() => (window as unknown as { pageKeydowns: number }).pageKeydowns);
}

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "Boot WebExt" }).click();
  await page.getByRole("button", { name: "Settings" }).click();
  const dialog = page.getByRole("dialog", { name: "Settings" });
  await expect(dialog).toBeVisible();
  return dialog;
}

test.describe("content script dialog, select and tooltip", () => {
  test("tooltip renders inside the shadow root", async ({ page, siteUrl }) => {
    await page.goto(`${siteUrl}/a`);
    await page.getByRole("button", { name: "Boot WebExt" }).hover();

    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toHaveText("Boot WebExt");
    expect(await tooltip.evaluate(element => element.getRootNode() instanceof ShadowRoot)).toBe(true);
  });

  test("dialog keeps focus and keystrokes away from the page and locks its scrolling", async ({ page, siteUrl }) => {
    await page.goto(`${siteUrl}/a`);
    const dialog = await openSettings(page);
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).overflow)).toBe("hidden");

    const input = dialog.getByLabel("Storage demo");
    await expect(input).toBeEnabled();
    await input.fill("");
    await input.pressSequentially("Typed in a dialog");
    expect(await pageKeydowns(page)).toBe(0);

    // The dialog has three focusable controls; Tab keeps cycling through them.
    for (let press = 0; press < 7; press++) {
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate(element => element.contains((element.getRootNode() as ShadowRoot).activeElement))).toBe(true);
    }
    expect(await pageKeydowns(page)).toBe(0);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    expect(await page.evaluate(() => getComputedStyle(document.body).overflow)).not.toBe("hidden");
    // Focus goes back to the button that opened the panel.
    await expect.poll(() => page.evaluate(() => {
      return document.querySelector("boot-webext")?.shadowRoot?.activeElement?.getAttribute("aria-label");
    })).toBe("Boot WebExt");

    await page.getByRole("button", { name: "Boot WebExt" }).click();
    await expect(page.getByTestId("storage-value")).toHaveText("Typed in a dialog");
  });

  test("select works with the keyboard inside the shadow root", async ({ page, siteUrl }) => {
    await page.goto(`${siteUrl}/a`);
    const dialog = await openSettings(page);

    const trigger = dialog.getByRole("combobox", { name: "Theme" });
    await expect(trigger).toHaveText("System");
    await trigger.focus();
    await page.keyboard.press("Enter");
    // The list moves focus to the selected option once it has been positioned.
    await expect(page.getByRole("option", { name: "System" })).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(page.getByRole("option", { name: "Dark" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(trigger).toHaveText("Dark");
    await expect.poll(() => page.evaluate(() => {
      return document.querySelector("boot-webext")?.shadowRoot?.querySelector("div")?.classList.contains("dark");
    })).toBe(true);
  });
});

test("reading time badge follows the article through single-page navigation", async ({ page, siteUrl }) => {
  await page.goto(`${siteUrl}/spa/long`);
  const badge = page.getByTestId("reading-time");
  await expect(badge).toHaveText("3 min read · 451 words");

  await page.getByRole("link", { name: "No article" }).click();
  await expect(badge).toHaveCount(0);

  await page.getByRole("link", { name: "Short article" }).click();
  await expect(badge).toHaveText("1 min read · 31 words");

  // The app keeps the article element and replaces its content, badge included.
  await page.getByRole("link", { name: "Medium article" }).click();
  await expect(badge).toHaveText("2 min read · 251 words");
});

test("main world script counts the page's requests and the badge shows them", async ({ page, siteUrl, serviceWorker }) => {
  await page.goto(`${siteUrl}/requests`);
  await page.getByRole("button", { name: "Boot WebExt" }).click();

  await expect(page.getByTestId("page-request-count")).toHaveText("3");
  await expect(page.getByTestId("page-requests").getByRole("listitem")).toHaveText([
    `GET ${siteUrl}/api/three`,
    `POST ${siteUrl}/api/two`,
    `GET ${siteUrl}/api/one`,
  ]);
  // The wrapped fetch still rejects the way the browser's own does.
  expect(await page.evaluate(() => (window as unknown as { invalidFetch: string }).invalidFetch)).toBe("TypeError");

  // The page can fire the snapshot event itself; one that is not a snapshot is refused.
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent("boot-webext:page-requests", { detail: JSON.stringify({ count: 99, recent: "forged" }) }));
  });
  await page.evaluate(() => fetch("/api/four"));
  await expect(page.getByTestId("page-request-count")).toHaveText("4");

  await expect.poll(() => serviceWorker.evaluate(async (url) => {
    const { chrome } = globalThis as unknown as { chrome: ServiceWorkerChrome };
    const [tab] = await chrome.tabs.query({ url });
    return chrome.action.getBadgeText({ tabId: tab!.id! });
  }, `${siteUrl}/requests`)).toBe("4");
});

test("keyboard shortcuts are registered", async ({ serviceWorker }) => {
  const commands = await serviceWorker.evaluate(async () => {
    const { chrome } = globalThis as unknown as { chrome: ServiceWorkerChrome };
    return chrome.commands.getAll();
  });
  expect(commands.map(command => command.name)).toEqual(expect.arrayContaining(["toggle-panel", "copy-page-link"]));
  expect(commands.filter(command => command.name !== "_execute_action").every(command => command.shortcut)).toBe(true);
});

// Playwright cannot press browser-level shortcuts or click context menus, so these
// tests start from what the background does once one is used.
test("the panel opens and closes when the background asks", async ({ page, siteUrl, serviceWorker }) => {
  await page.goto(`${siteUrl}/a`);
  await expect(page.getByRole("button", { name: "Boot WebExt" })).toBeVisible();

  const togglePanel = () => serviceWorker.evaluate(async (url) => {
    const { chrome } = globalThis as unknown as { chrome: ServiceWorkerChrome };
    const [tab] = await chrome.tabs.query({ url });
    // The message format of @webext-core/messaging, as `sendMessage("togglePanel")` sends it.
    await chrome.tabs.sendMessage(tab!.id!, { id: 1, type: "togglePanel", timestamp: Date.now() });
  }, `${siteUrl}/a`);

  await togglePanel();
  await expect(page.getByRole("dialog")).toContainText("This is the content script page.");
  await togglePanel();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("side panel shows the text the context menu sends", async ({ page, extensionId, serviceWorker }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(page.getByTestId("selected-text")).toHaveText("Nothing sent yet.");

  // What the "Send to the side panel" menu stores before the side panel shows it.
  await serviceWorker.evaluate(async () => {
    const { chrome } = globalThis as unknown as { chrome: ServiceWorkerChrome };
    await chrome.storage.session.set({ "selected-text": { text: "Selected words", pageTitle: "Page a" } });
  });
  await expect(page.getByTestId("selected-text")).toContainText("Selected words");
  await expect(page.getByTestId("selected-text")).toContainText("Page a");
});

test("side panel keeps receiving tab activity after the service worker restarts", async ({ context, page, extensionId, siteUrl }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);
  await expect(page.getByTestId("activity-status")).toHaveText("Live");

  const first = await context.newPage();
  await first.goto(`${siteUrl}/first`);
  await expect(page.getByTestId("activity")).toContainText("Page first");

  // Stop the extension's service worker the way the browser does when it is idle.
  const session = await context.newCDPSession(page);
  await session.send("ServiceWorker.enable");
  await session.send("ServiceWorker.stopAllWorkers");
  await expect(page.getByText("reconnected 1 time")).toBeVisible();
  await expect(page.getByTestId("activity-status")).toHaveText("Live");

  const second = await context.newPage();
  await second.goto(`${siteUrl}/second`);
  await expect(page.getByTestId("activity")).toContainText("Page second");
});

test("popup copies the page link through the offscreen document", async ({ context, extensionId, siteUrl }) => {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(popup.getByTestId("active-tab")).toHaveText("Boot WebExt");
  await popup.getByRole("button", { name: "Copy page link" }).click();

  // Opened as a tab, the popup page is the active tab itself.
  const link = `[Boot WebExt](chrome-extension://${extensionId}/popup.html)`;
  await expect(popup.getByTestId("copied-link")).toHaveText(`Copied ${link}`);

  // Headless Chromium keeps its own clipboard, separate from the system's.
  await context.grantPermissions(["clipboard-read"], { origin: siteUrl });
  const site = await context.newPage();
  await site.goto(`${siteUrl}/a`);
  await site.bringToFront();
  expect(await site.evaluate(() => navigator.clipboard.readText())).toBe(link);
});
