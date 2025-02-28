import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "node20",
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      formats: ["cjs"],
      fileName: () => "index.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      external: [],
    },
  },
});
