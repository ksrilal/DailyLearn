import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

/** Serves /api/ai during `vite dev` by delegating to the same handler used by
 * the Vercel serverless function, so the AI proxy works without `vercel dev`. */
function apiDevMiddleware(): Plugin {
  return {
    name: 'dailylearn-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/ai', async (req, res) => {
        const { handleAiRequest } = await server.ssrLoadModule('/api/_lib/handleAiRequest.ts');

        let body: unknown;
        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          try {
            body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
          } catch {
            body = undefined;
          }
        }

        const { status, body: responseBody } = await handleAiRequest(
          req.method ?? 'GET',
          body,
          req.headers.authorization,
        );
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(responseBody));
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load .env / .env.local etc. (including server-only vars without VITE_
  // prefix, via the empty 3rd-arg prefix) so /api/ai works under `vite dev`.
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    plugins: [
      react(),
      apiDevMiddleware(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon.svg'],
        manifest: {
          name: 'DailyLearn',
          short_name: 'DailyLearn',
          description: 'Lifelong micro-learning, one small lesson a day.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/icons/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,json}'],
          navigateFallbackDenylist: [/^\/api/],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
    },
  };
});
