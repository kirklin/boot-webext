import type { PageRequest, PageRequestSnapshot } from "~/lib/page-requests";
import { defineContentScript } from "#imports";
import { PAGE_REQUESTS_EVENT, PAGE_REQUESTS_QUERY_EVENT, RECENT_PAGE_REQUESTS } from "~/lib/page-requests";

/**
 * Runs in the page's own JavaScript world before any of the page's scripts, so it can
 * wrap the page's `fetch` and `XMLHttpRequest`. Scripts in this world have no
 * extension APIs; they report to the isolated content script through events on `window`.
 */
export default defineContentScript({
  matches: ["<all_urls>"],
  world: "MAIN",
  runAt: "document_start",
  main() {
    const snapshot: PageRequestSnapshot = { count: 0, recent: [] };

    const broadcast = () => {
      window.dispatchEvent(new CustomEvent(PAGE_REQUESTS_EVENT, { detail: JSON.stringify(snapshot) }));
    };
    const record = (request: PageRequest) => {
      snapshot.count++;
      snapshot.recent = [request, ...snapshot.recent].slice(0, RECENT_PAGE_REQUESTS);
      broadcast();
    };

    // The wrappers call the originals first, so the page sees the same results and errors
    // as before. A URL that does not parse never leaves the page and is not counted.
    const originalFetch = window.fetch;
    window.fetch = function fetch(input, init) {
      const response = originalFetch(input, init);
      const method = init?.method ?? (input instanceof Request ? input.method : "GET");
      const url = URL.parse(input instanceof Request ? input.url : input, document.baseURI);
      if (url) {
        record({ method: String(method).toUpperCase(), url: url.href });
      }
      return response;
    };

    const openedRequests = new WeakMap<XMLHttpRequest, PageRequest>();
    const { open, send } = XMLHttpRequest.prototype;
    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest, ...args: [method: string, url: string | URL, ...rest: unknown[]]) {
      // `open` has overloads with and without `async`, so the arguments are passed on as they came.
      Reflect.apply(open, this, args);
      // `open` has thrown above for a URL that does not parse.
      openedRequests.set(this, { method: String(args[0]).toUpperCase(), url: URL.parse(args[1], document.baseURI)!.href });
    };
    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
      send.call(this, body);
      const request = openedRequests.get(this);
      if (request) {
        record(request);
      }
    };

    window.addEventListener(PAGE_REQUESTS_QUERY_EVENT, broadcast);
  },
});
