import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '旅行足迹',
        short_name: '旅行足迹',
        description: '记录旅程、账单与足迹的旅行日记',
        lang: 'zh-CN',
        theme_color: '#8B5E3C',
        background_color: '#F7F2EA',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
    }),
  ],
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
