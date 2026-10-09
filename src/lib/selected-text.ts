import { storage } from "#imports";

export interface SelectedText {
  text: string;
  pageTitle?: string;
  pageUrl?: string;
}

/**
 * Text sent from the context menu to the side panel. Session storage is cleared when
 * the browser closes and content scripts cannot read it, so only the background and
 * extension pages import this module.
 */
export const selectedText = storage.defineItem<SelectedText | null>("session:selected-text", {
  fallback: null,
});
