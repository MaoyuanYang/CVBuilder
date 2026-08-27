import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: "src/content/index.ts",
      formats: ["iife"],
      name: "cvbuilderContent",
      fileName: () => "content.js",
    },
  },
});
