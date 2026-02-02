import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content/index.ts'),
      name: 'MarkdownReaderContent',
      fileName: 'index',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].global.js',
        dir: resolve(__dirname, 'dist/content')
      }
    }
  }
});
