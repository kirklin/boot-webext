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
    permissions: ["storage", "tabs"],
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
