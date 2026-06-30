import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  build: {
    outDir: "dist",
  },
  server: {
    proxy: {
      "/adminjv": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    include: ["tslib"]
  }
})
