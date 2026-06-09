import path from "path" 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { 
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://76.13.55.54:8000',
        changeOrigin: true,
      },
      '/API': {
        target: 'http://76.13.55.54:8080',
        changeOrigin: true,
      }
    }
  }
})