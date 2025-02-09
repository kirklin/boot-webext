import { presetAttributify, presetIcons, presetUno, transformerDirectives } from "unocss";
import presetChinese from "unocss-preset-chinese";
import presetEase from "unocss-preset-ease";
import { defineConfig } from "unocss/vite";

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetChinese(),
    presetEase(),
    presetIcons(),
  ],
  transformers: [
    transformerDirectives(),
  ],
});
