import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A relative base works on GitHub Pages (any sub-path), Vercel and locally.
const base = process.env.BASE_PATH || './';

export default defineConfig({
  base,
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
          pdf: ['jspdf'],
        },
      },
    },
  },
});
