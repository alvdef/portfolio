import { NextResponse } from 'next/server';
import { exchangeCodeForRefreshToken, getSpotifyEnv } from '@/server/spotify';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const env = getSpotifyEnv();
  if (!env || !env.redirectUri) {
    return new NextResponse(
      'Missing Spotify configuration. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REDIRECT_URI.',
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  if (!code) {
    return new NextResponse('Missing "code" query parameter from Spotify callback.', { status: 400 });
  }

  try {
    const tokens = await exchangeCodeForRefreshToken({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      code,
      redirectUri: env.redirectUri
    });

    if (!tokens?.refreshToken) {
      return new NextResponse(
        'Spotify did not return a refresh token. Remove app access in Spotify settings and try again.',
        { status: 502 }
      );
    }

    return new NextResponse(
      [
        'Spotify authorization complete.',
        '',
        `SPOTIFY_REFRESH_TOKEN=${tokens.refreshToken}`,
        '',
        'Copy this value into your .env file and restart the dev server.'
      ].join('\n'),
      {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        }
      }
    );
  } catch {
    return new NextResponse('Failed to exchange Spotify authorization code for tokens.', { status: 502 });
  }
}
