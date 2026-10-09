import type { Browser } from "#imports";
import type { TabActivity } from "~/lib/tab-activity";
import { browser, defineBackground, storage } from "#imports";
import { formatMarkdownLink } from "~/lib/markdown";
import { ignoreMissingReceiver, onMessage, sendMessage } from "~/lib/messaging";
import { selectedText } from "~/lib/selected-text";
import { openSidePanel } from "~/lib/side-panel";
import { storageDemo } from "~/lib/storage";
import { TAB_ACTIVITY_PORT } from "~/lib/tab-activity";

const MENU_SEND_SELECTION = "send-selection";
const MENU_COPY_PAGE_LINK = "copy-page-link";

// MV3 stops the service worker when it is idle and its variables go with it, so state
// that has to outlive a restart is kept in session storage.
const lastActivatedTab = storage.defineItem<number | null>("session:last-activated-tab", {
  fallback: null,
});

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async ({ reason }) => {
    // Context menus are kept across browser restarts, so they are created once per install or update.
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({
      id: MENU_SEND_SELECTION,
      title: "Send \"%s\" to the side panel",
      contexts: ["selection"],
    });
    browser.contextMenus.create({
      id: MENU_COPY_PAGE_LINK,
      title: "Copy page link as Markdown",
      contexts: ["page"],
    });

    // eslint-disable-next-line no-console
    console.log(`Extension ${reason}, storage demo is "${await storageDemo.getValue()}"`);
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab) {
      return;
    }
    if (info.menuItemId === MENU_SEND_SELECTION) {
      if (info.selectionText === undefined) {
        throw new Error("A selection menu was clicked without selected text");
      }
      // The side panel may only open in direct response to the click, so it comes before any await.
      void openSidePanel(tab.windowId);
      void selectedText.setValue({ text: info.selectionText, pageTitle: tab.title, pageUrl: tab.url });
    }
    if (info.menuItemId === MENU_COPY_PAGE_LINK) {
      void copyTabLink(tab);
    }
  });

  browser.commands.onCommand.addListener(async (command, tab) => {
    if (tab?.id === undefined) {
      return;
    }
    if (command === "toggle-panel") {
      await sendMessage("togglePanel", undefined, tab.id).catch(ignoreMissingReceiver);
    }
    if (command === "copy-page-link") {
      await copyTabLink(tab);
    }
  });

  void browser.action.setBadgeBackgroundColor({ color: "#525252" });
  onMessage("reportPageRequests", async ({ data: count, sender }) => {
    const tabId = sender.tab?.id;
    if (tabId === undefined) {
      throw new Error("reportPageRequests must be sent from a tab");
    }
    await browser.action.setBadgeText({ tabId, text: count === 0 ? "" : String(count) });
  });

  onMessage("getActiveTab", async ({ data: windowId }) => {
    const [tab] = await browser.tabs.query({ active: true, windowId });
    return { windowId, title: tab?.title };
  });

  onMessage("copyPageLink", async ({ data: windowId }) => {
    const [tab] = await browser.tabs.query({ active: true, windowId });
    if (!tab) {
      throw new Error(`Window ${windowId} has no active tab`);
    }
    return copyTabLink(tab);
  });

  // The side panel keeps a port open and receives tab activity as it happens.
  const activityPorts = new Set<Browser.runtime.Port>();
  browser.runtime.onConnect.addListener((port) => {
    if (port.name !== TAB_ACTIVITY_PORT) {
      return;
    }
    activityPorts.add(port);
    port.onDisconnect.addListener(() => activityPorts.delete(port));
  });
  const publish = (activity: Omit<TabActivity, "time">) => {
    const message: TabActivity = { ...activity, time: Date.now() };
    for (const port of activityPorts) {
      port.postMessage(message);
    }
  };

  browser.tabs.onCreated.addListener((tab) => {
    if (tab.id !== undefined) {
      publish({ kind: "created", tabId: tab.id, title: tab.title });
    }
  });
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
      publish({ kind: "loaded", tabId, title: tab.title });
    }
  });
  browser.tabs.onRemoved.addListener((tabId) => {
    publish({ kind: "removed", tabId });
  });

  // Read once when the service worker starts. Swapping the promise before any await keeps
  // quick tab switches in order, and session storage keeps the value across restarts.
  let lastActivatedTabId = lastActivatedTab.getValue();
  browser.tabs.onActivated.addListener(async ({ tabId }) => {
    const previousIdPromise = lastActivatedTabId;
    lastActivatedTabId = Promise.resolve(tabId);
    await lastActivatedTab.setValue(tabId);
    const previousId = await previousIdPromise;

    const tabs = await browser.tabs.query({});
    publish({ kind: "activated", tabId, title: tabs.find(tab => tab.id === tabId)?.title });

    // Closing a tab activates another one, and the closed tab is already gone.
    const previousTab = tabs.find(tab => tab.id === previousId);
    if (previousTab) {
      await sendMessage("tabActivated", { title: previousTab.title }, tabId).catch(ignoreMissingReceiver);
    }
  });
});

async function copyTabLink(tab: Browser.tabs.Tab) {
  if (tab.url === undefined) {
    throw new Error("The tab has no URL to copy");
  }
  const markdown = formatMarkdownLink(tab.title ?? tab.url, tab.url);
  await writeClipboard(markdown);
  return markdown;
}

let offscreenDocument: Promise<void> | undefined;

async function writeClipboard(text: string) {
  if (import.meta.env.FIREFOX) {
    // Firefox runs the background as a page, which can use the Clipboard API directly.
    await navigator.clipboard.writeText(text);
    return;
  }
  // A Chrome service worker has no DOM, so an offscreen document writes to the clipboard.
  offscreenDocument ??= createOffscreenDocument();
  await offscreenDocument;
  await sendMessage("writeClipboard", text);
}

async function createOffscreenDocument() {
  if (await browser.offscreen.hasDocument()) {
    return;
  }
  await browser.offscreen.createDocument({
    url: browser.runtime.getURL("/offscreen.html"),
    reasons: [browser.offscreen.Reason.CLIPBOARD],
    justification: "Write page links to the clipboard",
  });
}
