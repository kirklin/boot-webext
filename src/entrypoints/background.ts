import { browser, defineBackground } from "#imports";
import { onMessage, sendMessage } from "~/lib/messaging";
import { storageDemo } from "~/lib/storage";

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    // eslint-disable-next-line no-console
    console.log(`Extension ${reason}, storage demo is "${await storageDemo.getValue()}"`);
  });

  let previousTabId: number | undefined;

  browser.tabs.onActivated.addListener(async ({ tabId }) => {
    const previousId = previousTabId;
    previousTabId = tabId;
    if (previousId === undefined) {
      return;
    }

    // Closing a tab activates another one, and the closed tab is already gone.
    const previousTab = (await browser.tabs.query({})).find(tab => tab.id === previousId);
    if (previousTab === undefined) {
      return;
    }

    await sendMessage("tabActivated", { title: previousTab.title }, tabId).catch((error: unknown) => {
      // Browser pages and tabs opened before the extension was installed have no content script.
      if (!(error instanceof Error && error.message === "No response")) {
        throw error;
      }
    });
  });

  onMessage("getActiveTab", async ({ data: windowId }) => {
    const [tab] = await browser.tabs.query({ active: true, windowId });
    return { windowId, title: tab?.title };
  });
});
