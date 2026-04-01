import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('@reduxjs') || id.includes('react-redux')) return 'redux';
            if (id.includes('dayjs') || id.includes('axios') || id.includes('idb')) return 'utils';
            if (id.includes('react')) return 'vendor';
          }
        },
      },
    },
  },
});
