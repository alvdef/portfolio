import { NextResponse } from 'next/server';
import { buildAuthorizeUrl, getSpotifyEnv } from '@/server/spotify';

export const runtime = 'nodejs';

export async function GET() {
  const env = getSpotifyEnv();
  if (!env || !env.redirectUri) {
    return NextResponse.json(
      {
        error: 'Missing Spotify configuration. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REDIRECT_URI.'
      },
      { status: 500 }
    );
  }

  const authorizeUrl = buildAuthorizeUrl(env.clientId, env.redirectUri);
  return NextResponse.redirect(authorizeUrl);
}
