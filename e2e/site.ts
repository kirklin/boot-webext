import type { IncomingMessage, ServerResponse } from "node:http";

// Pages the content scripts run on during the tests. Every page counts the keydown
// events that reach it in `window.pageKeydowns`.
const keydownCounter = `<script>window.pageKeydowns = 0; addEventListener("keydown", () => { window.pageKeydowns++; });</script>`;

function page(title: string, body: string, head = "") {
  return `<!doctype html><html><head><title>${title}</title>${head}${keydownCounter}</head><body>${body}</body></html>`;
}

// A single-page app: links change the URL with `history.pushState` and render the
// route without loading a new page. While an article stays on screen, the app reuses
// the element and replaces what is inside it. `/spa/empty` has no article.
const singlePageApp = page("Single page app", `
  <nav>
    <a href="/spa/long" data-route>Long article</a>
    <a href="/spa/empty" data-route>No article</a>
    <a href="/spa/short" data-route>Short article</a>
    <a href="/spa/medium" data-route>Medium article</a>
  </nav>
  <main id="app"></main>
  <script>
    const routes = {
      "/spa/long": "<h1>Long</h1><p>" + "word ".repeat(450) + "</p>",
      "/spa/empty": null,
      "/spa/short": "<h1>Short</h1><p>" + "word ".repeat(30) + "</p>",
      "/spa/medium": "<h1>Medium</h1><p>" + "word ".repeat(250) + "</p>",
    };
    const render = () => {
      const app = document.getElementById("app");
      const content = routes[location.pathname];
      let article = app.querySelector("article");
      if (content === null) {
        app.innerHTML = "<p>Nothing to read here.</p>";
        return;
      }
      if (!article) {
        app.innerHTML = "";
        article = app.appendChild(document.createElement("article"));
      }
      article.innerHTML = content;
    };
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-route]");
      if (!link) return;
      event.preventDefault();
      history.pushState(null, "", link.href);
      render();
    });
    render();
  </script>
`);

// Sends two fetch requests and one XMLHttpRequest to `/api/` after the page has loaded,
// with URLs relative to its `<base>`. A fetch of a URL that does not parse rejects
// without sending anything, and `window.invalidFetch` keeps the name of its error.
const requestingPage = page("Requests", `
  <h1>Requests</h1>
  <script>
    addEventListener("load", async () => {
      await fetch("one");
      await fetch(new Request("two", { method: "POST", body: "{}" }));
      window.invalidFetch = await fetch("http://[").then(() => "resolved", error => error.name);
      const xhr = new XMLHttpRequest();
      xhr.open("GET", "three");
      xhr.send();
    });
  </script>
`, `<base href="/api/">`);

/**
 * `/<name>` serves "Page <name>", and `?root-font-size=<px>` changes its root font
 * size. `/spa/*`, `/requests` and `/api/*` serve the pages above.
 */
export function handleSiteRequest(request: IncomingMessage, response: ServerResponse) {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (url.pathname.startsWith("/api/")) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ path: url.pathname }));
    return;
  }

  let html: string;
  if (url.pathname.startsWith("/spa/")) {
    html = singlePageApp;
  } else if (url.pathname === "/requests") {
    html = requestingPage;
  } else {
    const title = `Page ${url.pathname.slice(1)}`;
    const rootFontSize = url.searchParams.get("root-font-size");
    const style = rootFontSize ? `<style>html { font-size: ${Number(rootFontSize)}px }</style>` : "";
    html = page(title, `<h1>${title}</h1>`, style);
  }
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(html);
}
