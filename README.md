# Al Kabeer Scan & Win (POC)

A shopper photographs their Al Kabeer Mozzarella Cheese Sticks pack. Gemini verifies it, and a genuine pack unlocks a scratch card with a demo prize.

Live: https://jaltech-pocs.web.app/alkabeer/ (Firebase project `tech-poc-a5f7a`, Hosting site `jaltech-pocs`)

## Stack

- **Vite + React 19** single-page app, built with base path `/alkabeer/` into `dist/alkabeer/`.
- **Cloud Function** `alkabeerScan` (2nd gen, us-central1, codebase `alkabeer`) in `functions/`. Hosting routes `POST /alkabeer/api/scan` to it. The Gemini key is the Secret Manager secret `ALKABEER_GEMINI_API_KEY` and never reaches the browser.

## Run locally

```bash
npm install
npm run install:functions
cp .env.example .env.local   # add GEMINI_API_KEY
npm run dev                  # http://localhost:5173/alkabeer/  (the API works locally too)
```

## Deploy

One-time: `npx firebase-tools functions:secrets:set ALKABEER_GEMINI_API_KEY --project tech-poc-a5f7a`

- **Function only** (from this repo): `npm run deploy:api`
- **Website**: deployed from the `jaltech-poc` monorepo root, which publishes `/unilever/` and `/alkabeer/` together. A Hosting deploy replaces the whole `jaltech-pocs` site, so never deploy Hosting from this repo.

## Files

| Path | Purpose |
| --- | --- |
| `functions/src/scan.js` | Gemini prompt, response schema, validation, prize draw |
| `functions/src/products.js` | Campaign products and prizes (the prompt is built from this list) |
| `functions/index.js` | Cloud Function `alkabeerScan` |
| `vite.config.js` | Base path, and `/alkabeer/api/scan` during `npm run dev` |
