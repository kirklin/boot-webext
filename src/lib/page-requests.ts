export interface PageRequest {
  method: string;
  url: string;
}

export interface PageRequestSnapshot {
  count: number;
  recent: PageRequest[];
}

/**
 * The main world script fires this on `window` with a JSON snapshot each time the
 * page sends a request, and whenever a content script asks for one. Only strings
 * cross reliably between the page's world and the extension's isolated world.
 */
export const PAGE_REQUESTS_EVENT = "boot-webext:page-requests";

/** Content scripts fire this on `window` to get the requests sent before they loaded. */
export const PAGE_REQUESTS_QUERY_EVENT = "boot-webext:page-requests-query";

export const RECENT_PAGE_REQUESTS = 5;

function isPageRequest(value: unknown): value is PageRequest {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { method, url } = value as Record<string, unknown>;
  return typeof method === "string" && typeof url === "string";
}

/**
 * Reads the snapshot in a `PAGE_REQUESTS_EVENT`. The page runs in the same world as the
 * script that fires the event and can fire it with anything, so a detail that is not a
 * snapshot throws before it reaches the extension.
 */
export function parsePageRequestSnapshot(detail: unknown): PageRequestSnapshot {
  if (typeof detail !== "string") {
    throw new TypeError("A page request snapshot must be a JSON string");
  }
  const value: unknown = JSON.parse(detail);
  if (typeof value !== "object" || value === null) {
    throw new TypeError("A page request snapshot must be an object");
  }
  const { count, recent } = value as Record<string, unknown>;
  if (!Number.isSafeInteger(count) || (count as number) < 0) {
    throw new TypeError("A page request snapshot needs a count of zero or more");
  }
  if (!Array.isArray(recent) || recent.length > RECENT_PAGE_REQUESTS || !recent.every(isPageRequest)) {
    throw new TypeError(`A page request snapshot needs up to ${RECENT_PAGE_REQUESTS} requests with a method and a URL`);
  }
  return { count: count as number, recent };
}
