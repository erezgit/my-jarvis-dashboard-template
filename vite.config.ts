import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import createHtmlPlugin from "vite-plugin-simple-html";

// Vite config for Cloudflare Pages.
// Functions are deployed from ./functions (Pages convention) — Vite only builds the SPA.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          mainScript: "src/main.tsx",
        },
      },
    }),
  ],
  esbuild: {
    keepNames: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
