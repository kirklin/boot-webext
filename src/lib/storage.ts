import { storage } from "#imports";

export type Theme = "light" | "dark" | "system";

export const storageDemo = storage.defineItem<string>("local:storage-demo", {
  fallback: "Storage Demo",
});

export const themePreference = storage.defineItem<Theme>("local:theme", {
  fallback: "system",
});
