var _a;
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    server: {
        host: "0.0.0.0",
        port: 5173,
        proxy: {
            "/api": {
                target: (_a = process.env.STS_API_PROXY_TARGET) !== null && _a !== void 0 ? _a : "http://localhost:8000",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ""); },
            },
        },
    },
    test: {
        environment: "jsdom",
        setupFiles: "./src/test/setup.ts",
        css: true,
    },
});
