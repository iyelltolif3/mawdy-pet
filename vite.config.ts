import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'lucide-react',
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Manifest se sirve dinámicamente desde el backend Express según el Host/subdominio
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            // Llamadas a /api/*: datos sensibles y dinámicos -> NetworkOnly (o NetworkFirst sin cache persistente)
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'api-sync-queue',
                options: {
                  maxRetentionTime: 24 * 60, // 24 horas
                },
              },
            },
          },
          {
            // Manifest dinámico -> NetworkFirst para actualizar si cambia el sponsor o config
            urlPattern: ({ url }) => url.pathname.startsWith('/manifest.json') || url.pathname.startsWith('/manifest.webmanifest'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'tenant-manifest-cache',
            },
          },
          {
            // App shell y assets estáticos (fuentes, logos, íconos) -> CacheFirst
            urlPattern: ({ request }) =>
              request.destination === 'style' ||
              request.destination === 'font' ||
              request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    host: 'localhost',
    port: 5173,
    hmr: {
      host: 'localhost',
    },
    proxy: {
      // Proxy /api al backend Express
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.host) {
              proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
              proxyReq.setHeader('Host', req.headers.host);
            }
          });
        },
      },
      // Proxy /manifest.json al backend Express
      '/manifest.json': {
        target: 'http://localhost:3001',
        changeOrigin: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.host) {
              proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
              proxyReq.setHeader('Host', req.headers.host);
            }
          });
        },
      },
      // Proxy /manifest.webmanifest al backend Express
      '/manifest.webmanifest': {
        target: 'http://localhost:3001',
        changeOrigin: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers.host) {
              proxyReq.setHeader('X-Forwarded-Host', req.headers.host);
              proxyReq.setHeader('Host', req.headers.host);
            }
          });
        },
      },
    },
  },
});
