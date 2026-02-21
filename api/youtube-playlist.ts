import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loadYoutubeRows } from './_youtube.js';

export default async function handler(_: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  try {
    const payload = await loadYoutubeRows();
    response.status(200).json({ ok: true, ...payload });
  } catch (error) {
    response.status(200).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to load YouTube playlist.'
    });
  }
}
