import { browser } from "#imports";

interface FirefoxSidebarAction {
  sidebarAction: { open: () => Promise<void> };
}

/**
 * Opens the side panel. Both browsers only allow this in direct response to a user
 * action, so call it before awaiting anything else in the handler.
 */
export function openSidePanel(windowId: number) {
  if (import.meta.env.FIREFOX) {
    // Firefox shows the side panel as a sidebar, an API Chrome's types do not include.
    return (browser as unknown as FirefoxSidebarAction).sidebarAction.open();
  }
  return browser.sidePanel.open({ windowId });
}
