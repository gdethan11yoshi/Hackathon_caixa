import {defineConfig} from 'vite';
import { resolve } from 'path'

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
    }
});