import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Aventura Pisicilor - Joc Matematică',
        short_name: 'Joc Matematică',
        description: 'Un joc interactiv de matematică.',
        theme_color: '#312e81',
        background_color: '#312e81',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
