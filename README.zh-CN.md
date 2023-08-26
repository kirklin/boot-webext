<div align='center'>
  <h1>boot-webext</h1>
  <p>一个使用 Vite 构建的 Web 扩展（适用于 Chrome、FireFox 等）的起始模板。</p>
</div>

<div align='center'>
<a href="README.md">English</a> | <b>简体中文</b>
</div>


## 特点

- ⚡️ **即时 HMR**: 在开发中使用 Vite 的快速热模块替换，无需手动刷新页面。
- 🥝 **Vue 3**: 利用 Vue 3 的组合 API、<script setup> 语法等强大特性。
- 💬 **轻松通讯**: 通过 webext-bridge 和 VueUse 存储无缝通信。
- 🌈 **UnoCSS**: 利用即时按需加载的原子 CSS 引擎 UnoCSS 进行高效的组件样式设计。
- 📜 **中文字体预设**: 包含中文字体预设 🇨🇳
- 🦾 **TypeScript**: 集成 TypeScript 实现类型安全，提升开发体验。
- 📦 **自动导入组件**: 自动导入组件，使开发流程更加顺畅。
- 🌟 **图标**: 直接从任何图标集中访问图标，增强设计流程。
- 🖥 **内容脚本**: 在内容脚本中也能充分发挥 Vue 的威力。
- 🌍 **Web 扩展**: 开发适用于 Chrome、FireFox 等多个浏览器的同构扩展。
- 📃 **带有完整类型支持的动态 manifest.json**: 灵活编写 manifest.json，拥有完整的类型支持。

### 编码风格

- [@kirklin/eslint-config](https://github.com/kirklin/eslint-config)

### 推荐的 IDE 设置

- 🌪️ [WebStorm](https://www.jetbrains.com/webstorm/)
- 💻 [VSCode](https://code.visualstudio.com/)
- 💡 [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)


## 快来试试吧！！

### GitHub 模板

[使用这个模板创建仓库](https://github.com/kirklin/boot-webext/generate).

### 克隆到本地

```bash
npx degit kirklin/boot-webext my-webext
cd my-webext
pnpm i
```

## 使用

### 开发

只需要执行以下命令，安装依赖后，你就可以开始开发你的扩展了。

```bash
pnpm run dev
```

### 构建

构建该应用只需要执行以下命令

```bash
pnpm run build
```

然后你会看到用于发布的 `dist` 文件夹被生成。

