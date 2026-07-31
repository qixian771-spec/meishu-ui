/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

// GitHub Pages project site: https://<user>.github.io/meishu-ui/
const pagesBase = process.env.GITHUB_PAGES === 'true' ? '/meishu-ui/' : '/';

export default defineConfig({
  base: pagesBase,
  plugins: [react(), glsl()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/liquid/__tests__/setup.ts'],
  },
});
