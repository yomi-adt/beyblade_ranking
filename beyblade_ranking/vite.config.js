import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/ test
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/beyblade_ranking/' : '/',
    server: {
    proxy: {
      '/api': {
        target: 'https://wpgbbx-backend.onrender.com', // your actual deployed backend URL
        changeOrigin: true,
        secure: true,
      },
    }
  }
})
