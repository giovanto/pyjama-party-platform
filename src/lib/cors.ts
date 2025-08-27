export function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  const allowList = (process.env.CORS_ALLOW_ORIGINS || 'https://pyjama-party.back-on-track.eu,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowList.includes(origin)) return origin;
  return allowList[0] || '*';
}

export function corsHeaders(req: Request, methods: string[] = ['GET']): Record<string, string> {
  const origin = getAllowedOrigin(req);
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': methods.join(', '),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

