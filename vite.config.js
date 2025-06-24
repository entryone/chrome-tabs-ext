import { defineConfig } from 'vite'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.js'),
      },
      output: {
        dir: 'dist',
        entryFileNames: '[name].js',
      },
    },
  },
});
