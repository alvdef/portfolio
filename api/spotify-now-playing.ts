import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchNowPlaying, getSpotifyEnv, refreshAccessToken } from './_spotify';

export default async function handler(_: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

  try {
    const env = getSpotifyEnv();
    if (!env?.refreshToken) {
      response.status(200).json({ playing: false });
      return;
    }

    const token = await refreshAccessToken({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      refreshToken: env.refreshToken
    });

    if (!token) {
      response.status(200).json({ playing: false });
      return;
    }

    const nowPlaying = await fetchNowPlaying(token);

    if (nowPlaying.status === 204 || !nowPlaying.ok) {
      response.status(200).json({ playing: false });
      return;
    }

    const payload = await nowPlaying.json();
    const artist = payload?.item?.artists?.[0]?.name;
    const title = payload?.item?.name;
    if (!artist || !title) {
      response.status(200).json({ playing: false });
      return;
    }

    response.status(200).json({
      playing: Boolean(payload?.is_playing),
      artist,
      title
    });
  } catch {
    response.status(200).json({ playing: false });
  }
}
