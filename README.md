# Chrome Extension Vue3 TypeScript Template


## Create a vue project starter with vue cli service.

1. `vue create ext`
2. Select “Manually select features”
3. Features
   1. TypeScript
   2. Router
   3. Vuex
   4. CSS-Pre-processors
   5. Unit Testing
4. Vue.js Version: 3
5. Use babel alongside TypeScript: Y
6. Use class-style component syntax: does n’t matter
7. Use history mode for router: n (important)
8. CSS pre-processor: Sass/SCSS (with dart-sass)
9. Linker / formatter config: ESLint + Prettier
   1. Link on save
10. Unit testing solution: Mocha + Chai
11. Config Files: In dedicated config files
12. Save this as a preset? DoesN’t matter

## Alias @

@ is an alias of the `src` folder.

```jsx
const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.ts', '.js', '.vue', '.json'],
    },
  },
};
```

## publicPath (vue.config.js)

By default, the `publicPath` attribute in vue.config.js is set to `“/”`.

What will do is,

The compiled `index.html` will import its resource files like this `<script src="/js/app.7b091f78.js"></script>`.

This works fine for development or production in regular circumstances, but not as a Chrome extension. The css and js files won’t load, the entire page will be empty.

By setting `publicPath` to `“”` will fix the problem, the result looks like `<script src="js/app.7b091f78.js"></script>`. The leading slash is gone and Chrome extension will accept it.

```jsx
const path = require('path');

module.exports = {
  publicPath: '', // cannot be /, otherwise chrome extension can't load the resources
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.ts', '.js', '.vue', '.json'],
    },
  },
};
```

## @types/chrome

To avoid errors with chrome APIs, we have to install `@types/chrome` with

```bash
npm i -D @types/chrome
```

In `tsconfig.json`, add `chrome` to `types` attribute like this.

```jsx
"types": ["webpack-env", "mocha", "chai", "chrome"]
```

## Core Logic and UI Code

The content and background scripts, and UI may depend on the same core logic. The content/background scripts and UI code can’t be placed in separate projects.

I will add a `core` folder in `src` to contain all logic code which will be shared between content/background scripts and UI (vue).

The `src` folder should be something like the following structure.

```
src/
├── background.ts
├── content.ts
├── core
│   └── util.ts
└── ui
    ├── assets
    ├── components
    ├── options.ts
    ├── Options.vue
    ├── popup.ts
    ├── Popup.vue
    ├── router
    ├── shims-vue.d.ts
    ├── store
    ├── utils
    └── views
```

The previous code in src are moved to the `ui` folder.

All logic will be placed in `core` folder.

Since will have both a popup page and an options page, I replaced `App.vue` and `main.ts` with `popup.ts` + `Popup.vue` and `options.ts` + `Options.vue`.

### Set min-width and min-height

`Popup.vue` and `Options.vue` are just a copy of the original `App.vue`.

In `Popup.vue`, please set `min-width` and `min-height` to be `50em`.

Otherwise the size of the popup window will be very small and unstable.

```scss
#app {
  min-width: 50em;
  min-height: 50em;
}
```

It won’t compile yet after all of these changes. We have to change the commands to run dev server and make production build.

## Compile Content and Background Scripts

Add a `webpack.config.js` for compiling content and background scripts.

```jsx
const path = require('path');

module.exports = {
  target: 'node',
  entry: {
    content: './src/content.ts',
    background: './src/background.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
```

`webpack.dev.js` and `webpack.prod.js` are added as a wrapper of `webpack.config.js`.

## Update Commands

In package.json, update the `scripts` section to the following

```json
"scripts": {
  "serve:popup": "vue-cli-service serve src/ui/popup.ts",
  "serve": "npm run serve:popup",
  "serve:options": "vue-cli-service serve src/ui/options.ts",
  "build:ext": "webpack --config webpack.prod.js",
  "build:options": "vue-cli-service build --dest dist/ui/options src/ui/options.ts",
  "build:popup": "vue-cli-service build --dest dist/ui/popup src/ui/popup.ts",
  "build": "npm run build:ext && npm run build:options && npm run build:popup",
  "test:unit": "vue-cli-service test:unit",
  "lint": "vue-cli-service lint"
}
```

The `serve` commands are for running popup and options page development server.

- `src/ui/popup.ts` is appended as the entrypoint.

`build:ext` is for building content/background scripts with webpack.

`build:popup` and `build:options` are used to compile the UI of popup and options page.

- `--dest dist/ui/options src/ui/options.ts` appended to the commands to specify the output location and entrypoint.

`build` will compile everything.

## Dist

`dist` will contain the production build, the structure of it has the following structure

```
dist
├── background.js
├── content.js
├── manifest.json
└── ui
    ├── options
    │   ├── css
    │   ├── favicon.ico
    │   ├── img
    │   ├── index.html
    │   └── js
    └── popup
        ├── css
        ├── favicon.ico
        ├── img
        ├── index.html
        └── js
```

`ui` will contain the 2 pages.

## manifest.json

Here is the content of the `manifest.json`, it’s pretty straight forward.

Popup points to `ui/popup/index.html`.

Option points to `ui/options/index.html`.

```json
{
   "name": "Chrome Extension Vue3 TypeScript Template",
   "description": "A Chrome Extension Template built with TypeScript and Vue3",
   "version": "1.0",
   "author": "Kirk Lin",
   "manifest_version": 3,
   "icons": {
      "16": "icons/icon16.png",
      "24": "icons/icon24.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
   },
   "content_scripts": [
      {
         "matches": ["<all_urls>"],
         "js": ["content.js"]
      }
   ],
   "background": {
      "service_worker": "background.js"
   },
   "permissions": ["downloads", "storage", "tabs"],
   "action": {
      "default_popup": "ui/popup/index.html"
   },
   "options_page": "ui/options/index.html"
}

```

You may add more configurations such as icons, the added files should be included within the `dist` folder.

