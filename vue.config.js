const path = require("path");

module.exports = {
  publicPath: "",
  outputDir: "dist/ui",
  configureWebpack: {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
      extensions: [".ts", ".js", ".vue", ".json"],
    },
  },
};
