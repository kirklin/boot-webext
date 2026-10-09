<div align="center">

<img src="./public/icon/128.png" alt="Boot WebExt" width="96" />

<h1>Boot WebExt</h1>

<p>基于 WXT、React、Tailwind CSS 和 shadcn/ui 的浏览器扩展起始模板。</p>

[English](./README.md) | **简体中文**

</div>

## 特点

- 一套代码构建 Chrome、Edge 和 Firefox 的 Manifest V3 扩展，manifest 根据 `src/entrypoints` 里的文件自动生成。
- 包含弹窗、选项页、侧边栏和内容脚本界面，全部用 React 19 和 shadcn/ui 组件编写。
- 内容脚本界面渲染在 shadow root 里，网页的样式和扩展的样式互不影响。弹出层、对话框、下拉选择和提示框都挂在 shadow root 内部，构建时把 `rem` 换算成 `px`，网页改了根字号界面大小也不变。
- 后台和其他环境之间用 [@webext-core/messaging](https://webext-core.aklinker1.io/messaging/installation) 收发带类型的消息。
- 用 [WXT 的存储接口](https://wxt.dev/storage) 定义带类型的存储项，配合 `useStorageItem` hook 使用，在一个环境里改的值会同步到所有环境。
- 支持浅色、深色和跟随系统三种主题，选择保存在扩展存储里，对各个页面和内容脚本界面都生效。
- 图标使用 [lucide](https://lucide.dev/)，也可以通过 `@iconify/tailwind4` 使用任意 [Iconify](https://icon-sets.iconify.design/) 图标集。
- 用 Vitest 写单元测试，用 Playwright 把构建好的扩展装进 Chromium 做端到端测试。
- 用 [@kirklin/eslint-config](https://github.com/kirklin/eslint-config) 做代码检查，simple-git-hooks 和 lint-staged 在每次提交时自动运行。

## 示例

模板附带几个在扩展里需要额外处理的功能示例，每个都在 `e2e/examples.spec.ts` 里有端到端测试。

- 内容脚本界面里的对话框、下拉选择和提示框（`src/entrypoints/content`）。对话框打开时，焦点留在对话框里，按 Esc 可以关闭，背后的网页不能滚动，在对话框里按的键也不会传到网页。Radix 通过 `document.activeElement` 查找获得焦点的元素，在 shadow root 里这个值只会是宿主元素；`src/lib/shadow-root-focus.ts` 里的 `followFocusIntoShadowRoots()` 让它返回 shadow root 里面的元素。
- 阅读时长标签（`src/entrypoints/reading-time.content`）。网页里有 `<article>` 时，标签显示在第一个 `<article>` 的顶部；单页应用切换路由以后，标签也会重新显示。
- 运行在网页自身 JavaScript 环境里的脚本（`src/entrypoints/page-requests.content.ts`）。它在网页的脚本之前运行，包装 `fetch` 和 `XMLHttpRequest`，再通过 `window` 上的事件把网页发出的请求告诉内容脚本。网页也能发出同样的事件，所以内容脚本收到每条消息都会先检查格式。面板列出最近的请求，扩展图标的角标显示请求总数。
- 右键菜单、快捷键和图标角标（`src/entrypoints/background.ts`）。网页上选中的文字可以通过右键菜单发送到侧边栏，`Alt+Shift+B` 显示或隐藏网页上的面板，`Alt+Shift+L` 把网页链接复制成 Markdown 格式。
- 侧边栏通过长连接端口接收标签页动态。浏览器会停止空闲的 service worker，端口随之断开，侧边栏随后重新连接，这次连接会让 service worker 重新启动。
- 在后台写入剪贴板。Chrome 的 service worker 没有 DOM，由 offscreen 文档写入（`src/entrypoints/offscreen`）；Firefox 的后台页面可以直接写入。

## 使用的技术

| 类别     | 技术                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 框架     | [WXT](https://wxt.dev/) 0.21、Vite 8                                   |
| 界面     | React 19、[shadcn/ui](https://ui.shadcn.com/)、Radix                   |
| 样式     | Tailwind CSS 4                                                         |
| 语言     | 类型检查用 TypeScript 7，需要调用 TypeScript 接口的工具用 TypeScript 6 |
| 测试     | Vitest 5、Testing Library、Playwright                                  |
| 代码检查 | ESLint 10                                                              |

## 开始使用

### 环境要求

- Node.js 22.22.2 及以上，或 24.15.0 及以上
- pnpm 12

### 安装

```bash
npx degit kirklin/boot-webext my-webext
cd my-webext
pnpm install
pnpm dev
```

`pnpm dev` 会打开装好扩展的 Chrome，文件改动后自动重新加载。`pnpm dev:firefox` 在 Firefox 里做同样的事。

发布之前，记得修改 `wxt.config.ts` 里的扩展名称和 Firefox 附加组件 ID（`browser_specific_settings.gecko.id`）、`package.json` 里的描述和版本号，以及 `public/icon` 里的图标。用不到的示例可以删掉，同时删掉 `wxt.config.ts` 里它们用到的权限和快捷键。

## 命令

| 命令                 | 说明                                                               |
| -------------------- | ------------------------------------------------------------------ |
| `pnpm dev`           | 在 Chrome 中开发                                                   |
| `pnpm dev:firefox`   | 在 Firefox 中开发                                                  |
| `pnpm build`         | 构建 Chrome 版本，输出到 `.output/chrome-mv3`                      |
| `pnpm build:firefox` | 构建 Firefox 版本，输出到 `.output/firefox-mv3`                    |
| `pnpm zip`           | 构建并打包，用于上架 Chrome 应用商店                               |
| `pnpm zip:firefox`   | 构建并打包，用于上架 Firefox 附加组件，同时生成审核要求的源码包    |
| `pnpm lint`          | 用 ESLint 检查代码（`pnpm lint:fix` 同时自动修复）                 |
| `pnpm typecheck`     | 用 TypeScript 7 做类型检查（`pnpm typecheck:ts6` 用 TypeScript 6） |
| `pnpm test`          | 运行单元测试                                                       |
| `pnpm test:e2e`      | 先构建，再用 Playwright 测试构建好的扩展                           |

端到端测试运行在 Playwright 下载的 Chromium 上，第一次运行前执行 `pnpm exec playwright install chromium --no-shell` 安装。

## 目录结构

| 路径                    | 内容                                                      |
| ----------------------- | --------------------------------------------------------- |
| `src/entrypoints`       | 后台脚本、内容脚本、弹窗、选项页、侧边栏和 offscreen 文档 |
| `src/components`        | 共用组件                                                  |
| `src/components/ui`     | 用 shadcn CLI 添加的组件                                  |
| `src/hooks`             | 存储、当前标签页、标签页动态、主题和弹层容器相关的 hook   |
| `src/lib`               | 消息协议、存储项和各个入口共用的代码                      |
| `src/styles/global.css` | Tailwind CSS 和 shadcn/ui 主题                            |
| `public`                | 图标等原样复制的文件                                      |
| `e2e`                   | Playwright 测试，以及运行内容脚本用的本地网站             |

## 添加 shadcn/ui 组件

```bash
pnpm shadcn add dropdown-menu
```

组件会添加到 `src/components/ui`。下拉菜单这类通过 portal 渲染的组件，要在内容脚本里使用，需要改一处：像同一目录里的对话框、弹出层、下拉选择和提示框那样，把 `usePortalContainer()` 传给它的 `Portal`。在扩展页面里这个 hook 不返回容器，弹层照常挂在 `document.body` 上。

## 许可证

[MIT](./LICENSE) License © 2025-PRESENT [Kirk Lin](https://github.com/kirklin)
