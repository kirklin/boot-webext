<div align="center">

<img src="./public/icon/128.png" alt="Boot WebExt" width="96" />

<h1>Boot WebExt</h1>

<p>A WebExtension starter template built with WXT, React, Tailwind CSS and shadcn/ui.</p>

**English** | [简体中文](./README.zh-CN.md)

</div>

## Features

- One codebase builds Manifest V3 extensions for Chrome, Edge and Firefox. The manifest is generated from the files in `src/entrypoints`.
- A popup, an options page, a side panel and a content script UI, all written in React 19 with shadcn/ui components.
- The content script UI renders in a shadow root, so the page's styles and the extension's styles never mix. Popovers portal into the shadow root, and `rem` units are converted to `px` at build time, so the UI keeps its size on pages that change their root font size.
- Typed messaging between the background and the other contexts with [@webext-core/messaging](https://webext-core.aklinker1.io/messaging/installation).
- Typed storage with [WXT's storage API](https://wxt.dev/storage) and a `useStorageItem` hook. A value changed in one context shows up in every other context.
- Light, dark and system themes. The choice is kept in extension storage and applies to the pages and the content script UI.
- Icons from [lucide](https://lucide.dev/) and from any [Iconify](https://icon-sets.iconify.design/) icon set through `@iconify/tailwind4`.
- Unit tests with Vitest, and end-to-end tests with Playwright that load the built extension into Chromium.
- ESLint with [@kirklin/eslint-config](https://github.com/kirklin/eslint-config), run on every commit by simple-git-hooks and lint-staged.

## Tech Stack

| Category     | Technology                                                                   |
| ------------ | ---------------------------------------------------------------------------- |
| Framework    | [WXT](https://wxt.dev/) 0.21, Vite 8                                         |
| UI           | React 19, [shadcn/ui](https://ui.shadcn.com/), Radix                         |
| Styling      | Tailwind CSS 4                                                               |
| Language     | TypeScript 7 for type checking, TypeScript 6 for the tools that need its API |
| Testing      | Vitest 5, Testing Library, Playwright                                        |
| Code quality | ESLint 10                                                                    |

## Getting Started

### Prerequisites

- Node.js 22.22.2 or later, or 24.15.0 or later
- pnpm 12

### Setup

```bash
npx degit kirklin/boot-webext my-webext
cd my-webext
pnpm install
pnpm dev
```

`pnpm dev` opens Chrome with the extension installed and reloads it when files change. `pnpm dev:firefox` does the same in Firefox.

Before publishing, change the extension name in `wxt.config.ts`, the description and version in `package.json`, the icons in `public/icon`, and the Firefox add-on ID (`browser_specific_settings.gecko.id`) in `wxt.config.ts`.

## Scripts

| Command              | Description                                                                          |
| -------------------- | ------------------------------------------------------------------------------------ |
| `pnpm dev`           | Start development in Chrome                                                          |
| `pnpm dev:firefox`   | Start development in Firefox                                                         |
| `pnpm build`         | Build for Chrome into `.output/chrome-mv3`                                           |
| `pnpm build:firefox` | Build for Firefox into `.output/firefox-mv3`                                         |
| `pnpm zip`           | Build and zip for the Chrome Web Store                                               |
| `pnpm zip:firefox`   | Build and zip for Firefox Add-ons, together with the sources zip AMO review asks for |
| `pnpm lint`          | Lint with ESLint (`pnpm lint:fix` also fixes)                                        |
| `pnpm typecheck`     | Type check with TypeScript 7 (`pnpm typecheck:ts6` uses TypeScript 6)                |
| `pnpm test`          | Run unit tests                                                                       |
| `pnpm test:e2e`      | Build, then run the Playwright tests against the built extension                     |

The end-to-end tests run on the Chromium that Playwright downloads. Install it once with `pnpm exec playwright install chromium --no-shell`.

## Project Structure

| Path                    | Contents                                                  |
| ----------------------- | --------------------------------------------------------- |
| `src/entrypoints`       | Background, content script, popup, options and side panel |
| `src/components`        | Shared components                                         |
| `src/components/ui`     | Components added by the shadcn CLI                        |
| `src/hooks`             | Hooks for storage, the active tab, the theme and portals  |
| `src/lib`               | Messaging protocol and storage items                      |
| `src/styles/global.css` | Tailwind CSS and the shadcn/ui theme                      |
| `public`                | Icons and other files copied as they are                  |
| `e2e`                   | Playwright tests                                          |

## Adding shadcn/ui Components

```bash
pnpm shadcn add dialog
```

Components are added to `src/components/ui`. A component that renders through a portal, such as a dialog, select, dropdown menu or tooltip, needs one change before it works in the content script: pass `usePortalContainer()` to its `Portal`, as `src/components/ui/popover.tsx` does. On extension pages the hook returns nothing, and the portal stays on `document.body`.

## License

[MIT](./LICENSE) License © 2025-PRESENT [Kirk Lin](https://github.com/kirklin)
