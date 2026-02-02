import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { resolve } from 'path';

// Shared configuration
const baseConfig = {
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    UnoCSS({
      // UnoCSS configuration
    })
  ]
};

// Background script config
export default defineConfig({
  ...baseConfig,
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts')
      },
      output: {
        entryFileNames: '[name].mjs',
        dir: resolve(__dirname, 'dist/background')
      }
    }
  }
});
