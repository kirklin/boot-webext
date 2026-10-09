import { expect, test } from "./fixtures";

test("popup shows the active tab and the stored value", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`);

  await expect(page.getByRole("heading", { name: "Popup" })).toBeVisible();
  await expect(page.getByTestId("storage-value")).toHaveText("Storage Demo");
  // Opened as a tab, the popup page is the active tab itself.
  await expect(page.getByTestId("active-tab")).toHaveText("Boot WebExt");
});

test("side panel shows the active tab", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/sidepanel.html`);

  await expect(page.getByRole("heading", { name: "Side panel" })).toBeVisible();
  await expect(page.getByTestId("active-tab")).toHaveText("Boot WebExt");
});

test("options page writes storage that other pages follow", async ({ context, extensionId }) => {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html`);

  const input = options.getByLabel("Storage demo");
  await expect(input).toBeEnabled();
  await input.fill("Hello from options");

  await expect(popup.getByTestId("storage-value")).toHaveText("Hello from options");
});

test("content script UI stays inside its shadow root with shadcn styles", async ({ page, siteUrl }) => {
  await page.goto(`${siteUrl}/a`);

  const trigger = page.getByRole("button", { name: "Boot WebExt" });
  // `shadow-lg` depends on Tailwind's `@property` rules, which only work in the document.
  await expect(trigger).not.toHaveCSS("box-shadow", "none");
  await trigger.click();

  const popover = page.getByRole("dialog");
  await expect(popover.getByText("This is the content script page.")).toBeVisible();
  await expect(popover.getByTestId("storage-value")).toHaveText("Storage Demo");
  await expect(popover).toHaveCSS("background-color", "oklch(1 0 0)");
  expect(await popover.evaluate(element => element.getRootNode() instanceof ShadowRoot)).toBe(true);
});

test("content script UI keeps its size when a page changes the root font size", async ({ page, siteUrl }) => {
  await page.goto(`${siteUrl}/small?root-font-size=10`);

  const box = await page.getByRole("button", { name: "Boot WebExt" }).boundingBox();
  expect(box?.width).toBe(40);
  expect(box?.height).toBe(40);
});

test("background tells the content script which tab was active before", async ({ context, siteUrl }) => {
  const pageA = await context.newPage();
  await pageA.goto(`${siteUrl}/a`);
  const pageB = await context.newPage();
  await pageB.goto(`${siteUrl}/b`);

  await pageA.bringToFront();
  await pageB.bringToFront();
  await pageB.getByRole("button", { name: "Boot WebExt" }).click();

  await expect(pageB.getByTestId("previous-tab")).toHaveText("Page a");
});

test("theme chosen in options reaches extension pages and content scripts", async ({ context, extensionId, siteUrl }) => {
  const site = await context.newPage();
  await site.goto(`${siteUrl}/a`);
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup.html`);
  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/options.html`);

  await options.getByRole("radio", { name: "Dark" }).click();

  await expect(options.locator("html")).toHaveClass(/\bdark\b/);
  await expect(popup.locator("html")).toHaveClass(/\bdark\b/);
  await expect.poll(() => site.evaluate(() => {
    const container = document.querySelector("boot-webext")?.shadowRoot?.querySelector("div");
    return container?.classList.contains("dark");
  })).toBe(true);
});

test.describe("with a dark browser color scheme", () => {
  test.use({ colorScheme: "dark" });

  test("the system theme follows the browser", async ({ page, extensionId }) => {
    await page.goto(`chrome-extension://${extensionId}/popup.html`);

    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.locator("body")).toHaveCSS("background-color", "oklch(0.145 0 0)");
  });
});
