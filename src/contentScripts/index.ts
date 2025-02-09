/* eslint-disable no-console */
import { createApp } from "vue";
import { onMessage } from "webext-bridge/content-script";
import { setupApp } from "~/logic/common-setup";
import App from "./views/App.vue";

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info("[boot-webext] Hello world from content script");

  // communication example: send previous tab title from background page
  onMessage("tab-prev", ({ data }) => {
    console.log(`[boot-webext] Navigate from page "${data.title}"`);
  });

  // mount component to context window
  const container = document.createElement("div");
  container.id = __NAME__;
  const root = document.createElement("div");
  const styleEl = document.createElement("link");
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? "open" : "closed" }) || container;
  styleEl.setAttribute("rel", "stylesheet");
  styleEl.setAttribute("href", browser.runtime.getURL("dist/contentScripts/style.css"));
  shadowDOM.appendChild(styleEl);
  shadowDOM.appendChild(root);
  document.body.appendChild(container);
  const app = createApp(App);
  setupApp(app);
  app.mount(root);
})();
