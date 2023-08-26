import { isFirefox, isForbiddenUrl } from "~/env";

/**
 * Listens to the `webNavigation.onCommitted` event and injects the latest scripts into the tab.
 * 监听 `webNavigation.onCommitted` 事件，并将最新脚本注入标签页。
 *
 * @param {Object} details - Details of the navigation event.
 *                          导航事件的详细信息。
 */
browser.webNavigation.onCommitted.addListener(({ tabId, frameId, url }) => {
  // Ensure that only the main window events are processed.
  // 确保只处理主窗口事件。
  if (frameId !== 0) {
    return;
  }

  if (isForbiddenUrl(url)) {
    return;
  }

  // Inject the latest scripts.
  // 注入最新的脚本。
  browser.tabs.executeScript(tabId, {
    file: `${isFirefox ? "" : "."}/dist/contentScripts/index.global.js`,
    runAt: "document_end",
  }).catch(error => console.error(error));
});
