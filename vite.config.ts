import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/triad-widget.tsx",
      name: "TriadWidget",
      fileName: () => "triad-widget.js",
      formats: ["iife"],
    },
    rollupOptions: {
      external: [],
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});