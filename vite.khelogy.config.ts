import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: resolve(projectRoot, 'khelogy'),
  base: './',
  publicDir: resolve(projectRoot, 'public'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src'),
    },
  },
  build: {
    outDir: resolve(projectRoot, 'dist-khelogy'),
    emptyOutDir: true,
    assetsDir: 'bundles',
    sourcemap: false,
    target: 'es2020',
  },
});
