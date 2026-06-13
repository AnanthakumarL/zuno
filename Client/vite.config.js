import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../server/public/client',
    emptyOutDir: true,
  },
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api/v1': {
        target: 'http://localhost:7999',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
