import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

export default defineConfig({
  base: '/Laeufer_Randomizer/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      scope: '/Laeufer_Randomizer/',
      base: '/Laeufer_Randomizer/',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Volleyball Team Generator',
        short_name: 'Laeufer',
        description: 'Faire Volleyball-Teams per Knopfdruck',
        start_url: '/Laeufer_Randomizer/',
        scope: '/Laeufer_Randomizer/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1c1917',
        theme_color: '#1c1917',
        lang: 'de',
        icons: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: '/Laeufer_Randomizer/index.html',
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
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
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
