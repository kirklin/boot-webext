import { createContext, use } from "react";

/**
 * Content script UIs live in a shadow root, so popovers and dialogs have to
 * portal into an element inside it to keep their styles. Extension pages
 * provide nothing and keep portalling to `document.body`.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export function usePortalContainer() {
  return use(PortalContainerContext) ?? undefined;
}
