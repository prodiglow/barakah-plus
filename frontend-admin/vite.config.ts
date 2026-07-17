import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "/", // ⭐ REQUIRED FOR VERCEL
  plugins: [react()],
  server: {
    port: 5174,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'react-vendor': ['react', 'react-dom'],
          'chart-vendor': ['recharts'],
          'http-vendor': ['axios'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
