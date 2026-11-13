import { scanImage, validateScanBody, ScanError } from './_lib/scan.js';

// Vercel Function: POST /api/scan  { image: <base64>, mimeType: 'image/jpeg' }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST to send a photo.' });
  }
  try {
    const input = validateScanBody(req.body);
    const result = await scanImage(input);
    return res.status(200).json(result);
  } catch (err) {
    const status = err instanceof ScanError ? err.status : 500;
    if (!(err instanceof ScanError)) console.error('[scan] Unexpected error:', err);
    return res.status(status).json({ error: err instanceof ScanError ? err.message : 'Something went wrong on our side. Try again.' });
  }
}
