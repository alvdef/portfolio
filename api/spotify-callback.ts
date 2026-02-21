import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exchangeCodeForRefreshToken, getSpotifyEnv } from './_spotify';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const env = getSpotifyEnv();
  if (!env || !env.redirectUri) {
    response.status(500).send('Missing Spotify configuration. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REDIRECT_URI.');
    return;
  }

  const code = request.query.code;
  if (typeof code !== 'string' || !code) {
    response.status(400).send('Missing "code" query parameter from Spotify callback.');
    return;
  }

  try {
    const tokens = await exchangeCodeForRefreshToken({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      code,
      redirectUri: env.redirectUri
    });

    if (!tokens?.refreshToken) {
      response.status(502).send('Spotify did not return a refresh token. Remove app access in Spotify settings and try again.');
      return;
    }

    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.status(200).send(
      [
        'Spotify authorization complete.',
        '',
        `SPOTIFY_REFRESH_TOKEN=${tokens.refreshToken}`,
        '',
        'Copy this value into your .env file and restart the dev server.'
      ].join('\n')
    );
  } catch {
    response.status(502).send('Failed to exchange Spotify authorization code for tokens.');
  }
}
