import type { Browser } from "#imports";
import type { TabInfo } from "~/lib/messaging";
import { useEffect, useState } from "react";
import { browser } from "#imports";
import { sendMessage } from "~/lib/messaging";

/**
 * Asks the background for the active tab of the window this page is in, and
 * asks again when the tab switches or its title changes.
 */
export function useActiveTab() {
  const [tab, setTab] = useState<TabInfo>();

  useEffect(() => {
    let active = true;
    const windowId = browser.windows.getCurrent().then(({ id }) => id!);

    const refresh = () => {
      void windowId
        .then(id => sendMessage("getActiveTab", id))
        .then((info) => {
          if (active) {
            setTab(info);
          }
        });
    };
    const onUpdated = (_tabId: number, changeInfo: { title?: string }, updatedTab: Browser.tabs.Tab) => {
      if (updatedTab.active && changeInfo.title !== undefined) {
        refresh();
      }
    };

    refresh();
    browser.tabs.onActivated.addListener(refresh);
    browser.tabs.onUpdated.addListener(onUpdated);
    return () => {
      active = false;
      browser.tabs.onActivated.removeListener(refresh);
      browser.tabs.onUpdated.removeListener(onUpdated);
    };
  }, []);

  return tab;
}
