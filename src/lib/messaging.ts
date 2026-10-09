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
}

export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
