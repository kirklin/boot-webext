import { onMessage, sendMessage } from "webext-bridge/background";
import type { Tabs } from "webextension-polyfill";

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client");
  // load latest content script
  import("./contentScriptHMR");
}

/**
 * Event listener for when the extension is installed.
 * 扩展安装时的事件监听器。
 */
browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log("Extension installed");
});

/**
 * Keeps track of the previous active tab's ID.
 * 跟踪上一个激活的标签页的 ID。
 */
let previousTabId = 0;

/**
 * Event listener for when a tab is activated.
 * 激活标签页时的事件监听器。
 * @ignore communication example: send previous tab title from background page
 * @ignore see shim.d.ts for type declaration
 *
 * @param {Object} info - Information about the activated tab.
 * @param {number} info.tabId - The ID of the activated tab.
 */
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId;
    return;
  }

  let tab: Tabs.Tab;

  try {
    tab = await browser.tabs.get(previousTabId);
    previousTabId = tabId;
  } catch {
    return;
  }

  // eslint-disable-next-line no-console
  console.log("previous tab", tab);
  // Send a message to the content script in the previously active tab.
  // 向先前活动标签页中的内容脚本发送消息。
  sendMessage("tab-prev", { title: tab.title }, { context: "content-script", tabId });
});

/**
 * Handles the "get-current-tab" message.
 * 处理 "get-current-tab" 消息。
 *
 * @returns {Object} An object containing the title of the current tab.
 */
onMessage("get-current-tab", async () => {
  try {
    const tab = await browser.tabs.get(previousTabId);
    return {
      title: tab?.title,
    };
  } catch {
    return {
      title: undefined,
    };
  }
});
