import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: [
        "src/content.ts",
        "src/background.ts",
        "src/logosmapper.ts",
        "popup.html",
      ],
      formats: ["es"],
      fileName(_, entryName) {
        return `${entryName}.js`;
      },
      cssFileName: "assets/css/bootstrap.min",
    },
  },
  server: {
    open: "popup.html",
  },
});
