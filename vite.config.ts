import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: './web',
  build: {
    outDir: '../dist-web',
  },
  server: {
    port: 3000,
    open: true,
  },
});
