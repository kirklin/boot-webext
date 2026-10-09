/** Name of the long-lived port the side panel opens to receive tab activity. */
export const TAB_ACTIVITY_PORT = "tab-activity";

export interface TabActivity {
  kind: "created" | "activated" | "loaded" | "removed";
  tabId: number;
  title?: string;
  time: number;
}
