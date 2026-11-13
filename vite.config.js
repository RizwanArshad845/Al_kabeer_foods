import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Served at https://jaltech-pocs.web.app/alkabeer/ (see jaltech-poc/firebase.json).
const BASE = '/alkabeer/';

// Serves <BASE>api/scan during `npm run dev` with the same code the alkabeerScan Cloud Function runs,
// so local development doesn't need the Firebase emulator.
function localApi() {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(`${BASE}api/scan`, async (req, res) => {
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
          if (size > 10 * 1024 * 1024) return send(413, { error: 'That photo is too large. Try a smaller one.' });
          chunks.push(chunk);
        }
        // Reload .env on every request and import per request so edits take effect without restarting.
        const env = loadEnv(server.config.mode, process.cwd(), '');
        Object.assign(process.env, env);
        const { scanImage, validateScanBody, ScanError } = await server.ssrLoadModule('/functions/src/scan.js');
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null');
          const apiKey = env.ALKABEER_GEMINI_API_KEY || env.GEMINI_API_KEY;
          send(200, await scanImage(validateScanBody(body), apiKey));
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
    base: BASE,
    // dist/ is the Hosting root; the app lives in dist/alkabeer/ so it serves at /alkabeer/.
    build: { outDir: 'dist/alkabeer', emptyOutDir: true },
    plugins: [react(), localApi()],
    server: { host: true },
  };
});
