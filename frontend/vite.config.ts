// frontend/vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Raise chunk warning threshold slightly (charts are large)
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, long cache lifetime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Data fetching — separate from UI
          'vendor-query': ['@tanstack/react-query'],
          // Charts — largest dependency, isolated chunk
          'vendor-charts': ['recharts'],
          // Animations — optional, loaded lazily by Suspense
          'vendor-motion': ['framer-motion'],
        },
      },
    },
  },
})
