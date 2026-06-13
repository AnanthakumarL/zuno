import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
  build: {
    outDir: '../server/public/admin',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    middlewareMode: false,
    proxy: {
      // Must come first - more specific routes before general ones
      // FastAPI backend (products, orders, users, etc.)
      '/api/v1': {
        target: 'http://localhost:7999',
        changeOrigin: true,
        secure: false,
        ws: false,
        logLevel: 'debug', // Enable debug logging
      },
    }
  }
})
