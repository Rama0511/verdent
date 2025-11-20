import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                ssr: 'resources/js/ssr.tsx',
                refresh: true,
            }),
            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler'],
                },
            }),
            tailwindcss(),
            wayfinder({
                formVariants: true,
            }),
        ],
        esbuild: {
            jsx: 'automatic',
        },
        ...(isDev ? {
            server: {
                host: '0.0.0.0',
                port: 5173,
                strictPort: true,
                hmr: {
                    host: 'react.adminmonitoringanak.my.id',
                    protocol: 'wss',
                    clientPort: 443,
                },
                cors: {
                    origin: ['https://ta.adminmonitoringanak.my.id', 'https://react.adminmonitoringanak.my.id', 'http://localhost:8000'],
                    credentials: true,
                },
                allowedHosts: [
                    'react.adminmonitoringanak.my.id',
                    'localhost',
                    '127.0.0.1',
                ],
            },
        } : {}),
    };
});
