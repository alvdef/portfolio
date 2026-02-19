import type { VercelRequest, VercelResponse } from '@vercel/node';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';

async function refreshToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json.access_token as string | undefined;
}

export default async function handler(_: VercelRequest, response: VercelResponse) {
  try {
    const token = await refreshToken();
    if (!token) {
      response.status(200).json({ playing: false });
      return;
    }

    const nowPlaying = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` }
    });

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

    response.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
    response.status(200).json({
      playing: Boolean(payload?.is_playing),
      artist,
      title
    });
  } catch {
    response.status(200).json({ playing: false });
  }
}
