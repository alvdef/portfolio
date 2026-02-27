import { NextResponse } from 'next/server';
import { fetchNowPlaying, fetchRecentlyPlayed, getSpotifyEnv, refreshAccessToken } from '@/server/spotify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_HEADERS = { 'Cache-Control': 'no-cache, no-store' };

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

    if (nowPlaying.ok && nowPlaying.status !== 204) {
      const payload = await nowPlaying.json();
      const artist = payload?.item?.artists?.[0]?.name;
      const title = payload?.item?.name;

      if (artist && title && payload?.is_playing) {
        return NextResponse.json({ playing: true, artist, title }, { headers: CACHE_HEADERS });
      }
    }

    // Nothing playing — try recently played
    const recent = await fetchRecentlyPlayed(token);
    if (recent.ok) {
      const recentPayload = await recent.json();
      const track = recentPayload?.items?.[0]?.track;
      const artist = track?.artists?.[0]?.name;
      const title = track?.name;

      if (artist && title) {
        return NextResponse.json({ playing: false, artist, title, lastPlayed: true }, { headers: CACHE_HEADERS });
      }
    }

    return NextResponse.json({ playing: false }, { headers: CACHE_HEADERS });
  } catch {
    return NextResponse.json({ playing: false }, { headers: CACHE_HEADERS });
  }
}
