import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: "src/content.ts",
      output: {
        entryFileNames: (chunkInfo) => `${chunkInfo.name}.js`,
      },
    },
    minify: false,
  },
});
