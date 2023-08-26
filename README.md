<div align='center'>
  <h1>boot-webext</h1>
  <p>A Vite powered WebExtension (Chrome, FireFox, etc.) starter template.</p>
</div>

<div align='center'>
<b>English</b> | <a href="README.zh-CN.md">简体中文</a>
</div>

## Features

- ⚡️ **Instant HMR**: Utilize Vite's fast development server for instant Hot Module Replacement, eliminating the need for manual refreshing.
- 🥝 **Vue 3**: Harness the power of Vue 3 with Composition API, <script setup> syntax, and more.
- 💬 **Effortless Communications**: Seamlessly communicate between different contexts using the combination of webext-bridge and VueUse storage.
- 🌈 **UnoCSS**: Leverage the on-demand Atomic CSS engine, UnoCSS, to style your components efficiently.
- 📜 **Chinese Font Preset**: Includes a preset for Chinese fonts 🇨🇳
- 🦾 **TypeScript**: Ensure type safety and enhanced development experience with TypeScript integration.
- 📦 **Components Auto Importing**: Automatically import components for smoother development workflow.
- 🌟 **Icons**: Access icons directly from any iconset, enhancing your design process.
- 🖥 **Content Script**: Utilize the power of Vue even within content scripts.
- 🌍 **WebExtension**: Develop isomorphic extensions that work across browsers like Chrome, Firefox, and others.
- 📃 **Dynamic manifest.json with Full Type Support**: Craft your manifest.json with flexibility and full type support.

### Coding Style

- [@kirklin/eslint-config](https://github.com/kirklin/eslint-config)

### Recommended IDE Setup

- 🌪️ [WebStorm](https://www.jetbrains.com/webstorm/)
- 💻 [VSCode](https://code.visualstudio.com/)
- 💡 [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)


## Try it now!

### GitHub Template

[Create a repo from this template on GitHub](https://github.com/kirklin/boot-webext/generate).

### Clone to local

```bash
npx degit kirklin/boot-webext my-webext
cd my-webext
pnpm i
```

## Usage

### Development

Just run and install dependencies, then you can start to develop your extension.

```bash
pnpm run dev
```

### Build

To build the App, run

```bash
pnpm run build
```

And you will see the generated file in `dist` that ready to be served.

