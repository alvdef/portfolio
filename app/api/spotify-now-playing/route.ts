import { NextResponse } from 'next/server';
import { fetchNowPlaying, getSpotifyEnv, refreshAccessToken } from '@/server/spotify';

export const runtime = 'nodejs';

const CACHE_HEADERS = { 'Cache-Control': 's-maxage=15, stale-while-revalidate=30' };

export async function GET() {
  try {
    const env = getSpotifyEnv();
    if (!env?.refreshToken) {
      return NextResponse.json({ playing: false }, { headers: CACHE_HEADERS });
    }

    const token = await refreshAccessToken({
      clientId: env.clientId,
      clientSecret: env.clientSecret,
      refreshToken: env.refreshToken
    });

    if (!token) {
      return NextResponse.json({ playing: false }, { headers: CACHE_HEADERS });
    }

    const nowPlaying = await fetchNowPlaying(token);
    if (nowPlaying.status === 204 || !nowPlaying.ok) {
      return NextResponse.json({ playing: false }, { headers: CACHE_HEADERS });
    }

    const payload = await nowPlaying.json();
    const artist = payload?.item?.artists?.[0]?.name;
    const title = payload?.item?.name;

    if (!artist || !title) {
      return NextResponse.json({ playing: false }, { headers: CACHE_HEADERS });
    }

    return NextResponse.json(
      {
        playing: Boolean(payload?.is_playing),
        artist,
        title
      },
      { headers: CACHE_HEADERS }
    );
  } catch {
    return NextResponse.json({ playing: false }, { headers: CACHE_HEADERS });
  }
}
