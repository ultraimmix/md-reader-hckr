import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS()
  ],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        dir: resolve(__dirname, 'dist/popup')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
