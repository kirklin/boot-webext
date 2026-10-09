import { defineExtensionMessaging } from "@webext-core/messaging";

export interface TabInfo {
  windowId?: number;
  title?: string;
}

interface ProtocolMap {
  /** Popup and side panel ask the background for the active tab of their window. */
  getActiveTab: (windowId: number) => TabInfo;
  /** The background tells a tab's content script which tab was active before it. */
  tabActivated: (previousTab: TabInfo) => void;
  /** The background asks a tab's content script to show or hide its panel. */
  togglePanel: () => void;
  /** A content script reports how many requests its page has sent, shown on the badge. */
  reportPageRequests: (count: number) => void;
  /** The popup asks the background to copy the active tab of its window as a Markdown link. */
  copyPageLink: (windowId: number) => string;
  /** The background asks the offscreen document to write text to the clipboard. */
  writeClipboard: (text: string) => void;
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();

/**
 * Browser pages and tabs opened before the extension was installed have no content
 * script, so messages sent to them get no response. Any other error is rethrown.
 */
export function ignoreMissingReceiver(error: unknown) {
  if (!(error instanceof Error && error.message === "No response")) {
    throw error;
  }
}
