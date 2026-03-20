import { NextResponse, type NextRequest } from 'next/server';
import { loadLetterboxdRows } from '@/server/letterboxd';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get('username');
  if (!username) {
    return NextResponse.json({ ok: false, error: 'Missing username parameter.' }, { status: 400 });
  }

  try {
    const payload = await loadLetterboxdRows(username);
    return NextResponse.json(
      { ok: true, ...payload },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to load Letterboxd data.' },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  }
}
