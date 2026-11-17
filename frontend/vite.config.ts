import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'build' },
  server: {
    watch: { ignored: ['**/qa-results/**', '**/test-results/**', '**/build/**'] },
    proxy: {
      '/api': {
        target: process.env.STS_API_PROXY_TARGET || 'http://127.0.0.1:28000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', include: ['src/**/*.test.{ts,tsx}'], css: true },
});
