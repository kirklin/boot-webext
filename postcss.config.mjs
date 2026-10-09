import pxConversion from "postcss-px-conversion";

// Content script UIs live in a shadow root, where `rem` still follows the host
// page's root font size. Converting to `px` keeps every page the same size.
export default {
  plugins: [
    pxConversion({
      unitType: "rem",
      viewportUnit: "px",
      fontViewportUnit: "px",
      // The plugin divides by this width and multiplies by 100, so 1rem becomes 16px.
      viewportWidth: 100 / 16,
      // By default it skips values up to 1 and rules inside at-rules, and Tailwind puts every rule in `@layer`.
      minPixelValue: 0,
      allowMediaQuery: true,
      // Keep the factor fixed; a `viewport-width` comment would change it for its file.
      enablePerFileConfig: false,
    }),
  ],
};
