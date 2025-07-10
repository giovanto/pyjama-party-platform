# Pajama Party Platform V3 - Deployment Guide

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Mapbox Account**: Already configured with token

## Supabase Setup

### 1. Create New Project
```bash
# Go to https://supabase.com/dashboard
# Click "New project"
# Choose organization and enter:
# - Name: pajama-party-v3
# - Database Password: [generate strong password]
# - Region: [closest to your users]
```

### 2. Configure Database
```sql
-- Run this SQL in Supabase SQL Editor
-- Copy from: src/lib/database-schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables (stations, dreams, pajama_parties)
-- See database-schema.sql for complete schema
```

### 3. Get Supabase Credentials
```bash
# In Supabase Dashboard > Settings > API
# Copy these values:
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Vercel Deployment

### 1. Connect Repository
```bash
# Push latest changes to GitHub
git push origin v3-nextjs-implementation

# Go to vercel.com/dashboard
# Click "Add New Project"
# Import your GitHub repository
```

### 2. Configure Environment Variables
```bash
# In Vercel Dashboard > Project > Settings > Environment Variables
# Add these variables:

NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiZ2lvdmFudG8iLCJhIjoiY21jdnA4c3p0MDE1cDJqcXJjejE3Ymg3YiJ9.OKkbmDiZosRlNgJP-H86XA
NEXT_PUBLIC_SUPABASE_URL=[from_supabase_dashboard]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from_supabase_dashboard]
SUPABASE_SERVICE_ROLE_KEY=[from_supabase_dashboard]
NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
```

### 3. Deploy Settings
```bash
# Build Command: npm run build
# Output Directory: .next
# Install Command: npm ci
# Development Command: npm run dev
```

## Testing Strategy

### 1. Local Testing
```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Build test
npm run build
npm run start
```

### 2. API Testing
```bash
# Health check
curl https://your-domain.vercel.app/api/health

# Station search
curl "https://your-domain.vercel.app/api/stations/search?q=berlin"

# Stats endpoint
curl https://your-domain.vercel.app/api/stats

# Dream submission
curl -X POST https://your-domain.vercel.app/api/dreams \
  -H "Content-Type: application/json" \
  -d '{"from":"Berlin","to":"Vienna","name":"Test","email":"test@example.com","why":"Testing"}'
```

### 3. Database Testing
```sql
-- Test database connections
SELECT COUNT(*) FROM stations;
SELECT COUNT(*) FROM dreams;
SELECT COUNT(*) FROM pajama_parties;

-- Test data integrity
SELECT * FROM dreams WHERE created_at > NOW() - INTERVAL '24 hours';
```

## Monitoring & Debugging

### 1. Vercel Analytics
- Enable in Vercel Dashboard > Analytics
- Monitor performance and errors

### 2. Supabase Monitoring
- Dashboard > Database > Logs
- Monitor query performance

### 3. Error Handling
- Sentry integration (optional)
- Custom error boundaries
- API error logging

## Security Considerations

1. **Environment Variables**: Never commit secrets
2. **CORS**: Configure for production domain
3. **Rate Limiting**: Implement for API routes
4. **Input Validation**: Sanitize all user inputs
5. **Database Security**: Use Row Level Security (RLS)

## Performance Optimization

1. **Images**: Next.js Image optimization
2. **Caching**: Implement Redis for API responses
3. **CDN**: Vercel Edge Network
4. **Database**: Index optimization
5. **Bundle**: Analyze with `npm run analyze`

## Rollback Strategy

1. **Vercel**: Previous deployment rollback
2. **Database**: Migration rollback scripts
3. **Git**: Revert commits if needed
4. **DNS**: Backup domain configuration