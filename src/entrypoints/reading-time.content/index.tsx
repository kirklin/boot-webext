import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createShadowRootUi, defineContentScript } from "#imports";
import { ThemeProvider } from "~/components/theme-provider";
import { ReadingTime } from "./reading-time";
import "~/styles/global.css";

/** Shows the reading time at the top of the page's first `<article>`, wherever and whenever it appears. */
export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: "boot-webext-reading-time",
      position: "inline",
      anchor: "article",
      append: "first",
      onMount: (container, _shadow, host) => {
        const article = host.parentElement;
        if (!article) {
          throw new Error("The reading time badge was mounted outside an article");
        }
        const root = createRoot(container);
        root.render(
          <StrictMode>
            <ThemeProvider target={container}>
              <ReadingTime article={article} />
            </ThemeProvider>
          </StrictMode>,
        );
        return root;
      },
      onRemove: root => root?.unmount(),
    });

    // Mounts when an article appears and unmounts when it is removed.
    ui.autoMount();

    // Single-page apps change the URL without reloading the page. When they reuse the
    // article element and replace what is inside it, the badge goes with the old content
    // while the anchor stays, so autoMount alone would not bring it back. The event fires
    // while the URL changes, before the page shows the new route, so wait a frame first.
    ctx.addEventListener(window, "wxt:locationchange", () => {
      ctx.requestAnimationFrame(() => {
        ui.remove();
        ui.autoMount();
      });
    });
  },
});
