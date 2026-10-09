import type { PageRequestSnapshot } from "~/lib/page-requests";
import { useEffect, useState } from "react";
import { PAGE_REQUESTS_EVENT, PAGE_REQUESTS_QUERY_EVENT, parsePageRequestSnapshot } from "~/lib/page-requests";

/**
 * Listens for request snapshots from the main world script. The page can fire the
 * same events, so treat the numbers as information for the user only.
 */
export function subscribePageRequests(listener: (snapshot: PageRequestSnapshot) => void) {
  const onSnapshot = (event: Event) => {
    listener(parsePageRequestSnapshot((event as CustomEvent).detail));
  };
  window.addEventListener(PAGE_REQUESTS_EVENT, onSnapshot);
  // Ask for the requests the page sent before this content script loaded.
  window.dispatchEvent(new CustomEvent(PAGE_REQUESTS_QUERY_EVENT));
  return () => window.removeEventListener(PAGE_REQUESTS_EVENT, onSnapshot);
}

export function usePageRequests() {
  const [snapshot, setSnapshot] = useState<PageRequestSnapshot>({ count: 0, recent: [] });
  useEffect(() => subscribePageRequests(setSnapshot), []);
  return snapshot;
}
