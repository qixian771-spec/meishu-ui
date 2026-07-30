/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [react(), glsl()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/liquid/__tests__/setup.ts'],
  },
});
