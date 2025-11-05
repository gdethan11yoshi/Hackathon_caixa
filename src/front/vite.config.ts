import {defineConfig} from 'vite';
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    server: {
        allowedHosts: ['.trycloudflare.com']
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                admin: resolve(__dirname, 'liveView/index.html'),
            },
            output: {
                entryFileNames: 'assets/[name].[hash].js',
                chunkFileNames: 'assets/[name].[hash].js',
                assetFileNames: 'assets/[name].[hash][extname]',
            },
        },
    },
    plugins: [
        VitePWA({
            registerType: "autoUpdate",
            manifest: {
                name: 'CampusNav',
                short_name: 'CamNav',
                start_url: '/',
                display: 'standalone',
                background_color: '#ffffff',
                theme_color: '#0000FF'
            }
        })
    ]
});