// V1 config.js ported to TypeScript for V3
export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  mapbox: {
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!,
  },
  app: {
    countdownTarget: '2025-09-26T00:00:00Z',
    discordInvite: 'https://discord.gg/back-on-track',
  },
  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.vercel.app/api' 
      : 'http://localhost:3000/api',
    timeout: 30000,
  }
}