export function getAllowedOrigin(req: Request): string {
  const origin = req.headers.get('origin') || '';
  const allowList = (process.env.CORS_ALLOW_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  // Exact match allowlist
  if (allowList.includes(origin)) return origin;

  // Optional regex pattern to allow dynamic preview domains (e.g., Vercel branch URLs)
  const pattern = process.env.CORS_ALLOW_ORIGIN_PATTERN;
  if (pattern) {
    try {
      const re = new RegExp(pattern);
      if (re.test(origin)) return origin;
    } catch {
      // ignore invalid regex
    }
  }

  // Fallback to first allowed origin (or wildcard if absolutely necessary)
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
