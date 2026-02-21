import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildAuthorizeUrl, getSpotifyEnv } from './_spotify';

export default async function handler(_: VercelRequest, response: VercelResponse) {
  const env = getSpotifyEnv();
  if (!env || !env.redirectUri) {
    response.status(500).json({
      error: 'Missing Spotify configuration. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REDIRECT_URI.'
    });
    return;
  }

  const authorizeUrl = buildAuthorizeUrl(env.clientId, env.redirectUri);
  response.redirect(authorizeUrl);
}
