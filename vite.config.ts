import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 相对路径构建，便于部署到任意静态托管（Vercel / Netlify / GitHub Pages）
  base: './',
  build: {
    rollupOptions: {
      output: {
        // 拆分第三方库，减小首屏主包体积（首屏 Loading ≤2s）
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand', 'framer-motion'],
          charts: ['recharts'],
          dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
        },
      },
    },
  },
})
