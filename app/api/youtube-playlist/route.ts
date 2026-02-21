import { NextResponse } from 'next/server';
import { loadYoutubeRows } from '@/server/youtube';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const payload = await loadYoutubeRows();
    return NextResponse.json(
      { ok: true, ...payload },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to load YouTube playlist.'
      },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  }
}
