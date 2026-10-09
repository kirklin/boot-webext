import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createShadowRootUi, defineContentScript } from "#imports";
import { ThemeProvider } from "~/components/theme-provider";
import { sendMessage } from "~/lib/messaging";
import { followFocusIntoShadowRoots } from "~/lib/shadow-root-focus";
import App from "./app";
import { subscribePageRequests } from "./page-requests";
import "~/styles/global.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    // eslint-disable-next-line no-console
    console.info("[boot-webext] Hello world from content script");

    followFocusIntoShadowRoots();

    // The background shows the number on the extension icon's badge.
    const stopReporting = subscribePageRequests(({ count }) => {
      void sendMessage("reportPageRequests", count);
    });
    ctx.onInvalidated(stopReporting);

    const ui = await createShadowRootUi(ctx, {
      name: "boot-webext",
      position: "inline",
      anchor: "body",
      // Keep keystrokes typed into the UI away from the page's shortcuts.
      isolateEvents: true,
      onMount: (container) => {
        const root = createRoot(container);
        root.render(
          <StrictMode>
            <ThemeProvider target={container}>
              <App />
            </ThemeProvider>
          </StrictMode>,
        );
        return root;
      },
      onRemove: root => root?.unmount(),
    });

    ui.mount();
  },
});
