// Minimal Upstash Redis REST client helpers (no SDK dependency)
// Uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisRequest(path: string, method: 'GET' | 'POST' = 'GET') {
  if (!REDIS_URL || !REDIS_TOKEN) throw new Error('Upstash Redis not configured');
  const url = `${REDIS_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Upstash error ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function redisIncr(key: string): Promise<number> {
  const data = await redisRequest(`/incr/${encodeURIComponent(key)}`, 'POST');
  return Number(data.result ?? data);
}

export async function redisPTTL(key: string): Promise<number> {
  const data = await redisRequest(`/pttl/${encodeURIComponent(key)}`);
  return Number(data.result ?? data);
}

export async function redisPExpire(key: string, ttlMs: number): Promise<boolean> {
  const data = await redisRequest(`/pexpire/${encodeURIComponent(key)}/${ttlMs}`, 'POST');
  return Boolean(data.result ?? data);
}

export function isRedisConfigured(): boolean {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

