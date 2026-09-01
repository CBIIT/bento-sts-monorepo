import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/bento-sts-monorepo/v3/",
  plugins: [react()],
  resolve: {
    alias: {
      "next/link": fileURLToPath(new URL("./src/next-link.tsx", import.meta.url)),
      "next/navigation": fileURLToPath(new URL("./src/next-navigation.ts", import.meta.url)),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.STS_API_PROXY_TARGET ?? "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    globals: true,
    exclude: ["node_modules/**"],
  },
});
