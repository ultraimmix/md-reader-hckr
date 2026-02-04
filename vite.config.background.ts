import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: resolve(__dirname, 'dist/background'),
    lib: {
      entry: resolve(__dirname, 'src/background/index.ts'),
      name: 'MarkdownReaderBackground',
      fileName: () => 'index.new.mjs',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});
