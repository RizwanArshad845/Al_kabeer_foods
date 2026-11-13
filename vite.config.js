import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Serves /api/scan during `npm run dev` with the same logic Vercel runs in production,
// so local development doesn't need the Vercel CLI.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use('/api/scan', async (req, res) => {
        const send = (status, body) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        if (req.method !== 'POST') return send(405, { error: 'Use POST to send a photo.' });

        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 4.5 * 1024 * 1024) return send(413, { error: 'That photo is too large. Try a smaller one.' });
          chunks.push(chunk);
        }
        // Import per request so edits to api/_lib are picked up without restarting.
        const { scanImage, validateScanBody, ScanError } = await server.ssrLoadModule('/api/_lib/scan.js');
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
          send(200, await scanImage(validateScanBody(body)));
        } catch (err) {
          if (err instanceof SyntaxError) return send(400, { error: 'Send a JSON body with an image.' });
          if (err instanceof ScanError) return send(err.status, { error: err.message });
          console.error(err);
          send(500, { error: 'Something went wrong on our side. Try again.' });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Expose server-only vars (no VITE_ prefix) to the local API, never to the browser bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [react(), localApi()],
    server: { host: true },
  };
});
