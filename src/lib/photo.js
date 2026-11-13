// Photos are downscaled before upload: faster on mobile data, and well under Vercel's 4.5 MB body limit.
const MAX_EDGE = 1280;
const QUALITY = 0.85;

function toPhoto(source, width, height) {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);
  return { dataUrl, base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' };
}

export function photoFromVideo(video) {
  return toPhoto(video, video.videoWidth, video.videoHeight);
}

export async function photoFromFile(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose a photo file (JPEG or PNG).');
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This photo format can't be opened here. Try a JPEG or PNG.");
  }
  try {
    return toPhoto(bitmap, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

export async function checkPhoto(photo) {
  let res;
  try {
    res = await fetch(`${import.meta.env.BASE_URL}api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: photo.base64, mimeType: photo.mimeType }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    throw new Error(
      err.name === 'TimeoutError'
        ? 'The check took too long. Try again with a steady, well-lit photo.'
        : 'No connection. Check your internet and try again.',
    );
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `The check failed (error ${res.status}). Try again.`);
  return body;
}
