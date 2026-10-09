import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  imports: false,
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: "Boot WebExt",
    permissions: [
      "storage",
      "tabs",
      "contextMenus",
      "clipboardWrite",
      // Only Chrome has offscreen documents; Firefox's background page writes the clipboard itself.
      ...(browser === "firefox" ? [] : ["offscreen"]),
    ],
    commands: {
      "toggle-panel": {
        suggested_key: { default: "Alt+Shift+B" },
        description: "Show or hide the panel on the page",
      },
      "copy-page-link": {
        suggested_key: { default: "Alt+Shift+L" },
        description: "Copy the page link as Markdown",
      },
    },
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "boot-webext@kirk.hk",
          data_collection_permissions: {
            required: ["none"],
          },
        },
      },
    }),
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
