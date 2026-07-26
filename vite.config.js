import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      timeout: 30000,
      overlay: true,
    },
    // ── ADD THE PROXY CONFIGURATION HERE ──
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // ← Replace 5000 with your Flask port if it's different
        changeOrigin: true,
        secure: false,
      },
    },
  },
})