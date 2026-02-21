const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';

type SpotifyEnv = {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  redirectUri?: string;
};

type RuntimeEnv = Record<string, string | undefined>;

function readEnv(): RuntimeEnv {
  const runtime = globalThis as { process?: { env?: RuntimeEnv } };
  return runtime.process?.env ?? {};
}

export function getSpotifyEnv(): SpotifyEnv | null {
  const env = readEnv();
  const clientId = env.SPOTIFY_CLIENT_ID;
  const clientSecret = env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    refreshToken: env.SPOTIFY_REFRESH_TOKEN,
    redirectUri: env.SPOTIFY_REDIRECT_URI
  };
}

export function buildAuthorizeUrl(clientId: string, redirectUri: string) {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'user-read-currently-playing user-read-playback-state'
  });

  return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

export async function exchangeCodeForRefreshToken(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: params.redirectUri
    })
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return {
    accessToken: json.access_token as string | undefined,
    refreshToken: json.refresh_token as string | undefined
  };
}

export async function refreshAccessToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: params.clientId,
      client_secret: params.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: params.refreshToken
    })
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json.access_token as string | undefined;
}

export async function fetchNowPlaying(accessToken: string) {
  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
}
