import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import umamiPlugin from '../../shared/vite-plugin-umami.js'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        umamiPlugin(),
    ],
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            }
        }
    }
})
