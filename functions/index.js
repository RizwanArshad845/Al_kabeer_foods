import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import { scanImage, validateScanBody, ScanError } from './src/scan.js';

// Stored in Secret Manager:
//   npx firebase-tools functions:secrets:set ALKABEER_GEMINI_API_KEY --project tech-poc-a5f7a
const ALKABEER_GEMINI_API_KEY = defineSecret('ALKABEER_GEMINI_API_KEY');

// POST /alkabeer/api/scan  { image: <base64>, mimeType: 'image/jpeg' }
// Routed here by the Hosting rewrite in jaltech-poc/firebase.json.
export const alkabeerScan = onRequest(
  {
    region: 'us-central1',
    secrets: [ALKABEER_GEMINI_API_KEY],
    memory: '512MiB',
    timeoutSeconds: 60,
    maxInstances: 10, // caps cost if the demo URL gets hammered
  },
  async (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    if (req.method !== 'POST') {
      res.set('Allow', 'POST').status(405).json({ error: 'Use POST to send a photo.' });
      return;
    }
    try {
      const input = validateScanBody(req.body);
      res.status(200).json(await scanImage(input, ALKABEER_GEMINI_API_KEY.value()));
    } catch (err) {
      if (err instanceof ScanError) {
        if (err.status >= 500) logger.error('[alkabeerScan]', err.message);
        res.status(err.status).json({ error: err.message });
        return;
      }
      logger.error('[alkabeerScan] Unexpected error', err);
      res.status(500).json({ error: 'Something went wrong on our side. Try again.' });
    }
  },
);
