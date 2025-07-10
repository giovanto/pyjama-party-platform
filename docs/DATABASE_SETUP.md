# Database Setup Guide

This guide walks you through setting up the Supabase database for the Pajama Party Platform.

## Prerequisites

- [Supabase account](https://supabase.com) (free tier is sufficient)
- Node.js 18+ installed
- Project dependencies installed (`npm install`)

## Quick Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `pajama-party-platform`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be provisioned (1-2 minutes)

### 2. Get Database Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
   ```

### 4. Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `scripts/sql/01_create_schema.sql`
3. Paste it into the SQL editor
4. Click **Run** to execute the schema

### 5. Import Station Data

Run the import script to populate the stations table:

```bash
npm run db:setup
```

## Manual Database Setup

If you prefer to set up the database manually:

### Step 1: Create Tables

Execute the SQL in `scripts/sql/01_create_schema.sql`. This creates:

- **dreams table**: Stores user dream submissions
- **stations table**: European train station data
- **cleanup_log table**: Tracks automated cleanup operations

### Step 2: Import Stations

Use the European stations data import script:

```bash
node scripts/import-stations.js
```

## Database Schema

### Dreams Table

Stores user dream submissions with automatic 30-day expiration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `dreamer_name` | VARCHAR(255) | User's name |
| `origin_station` | VARCHAR(255) | Starting train station |
| `destination_city` | VARCHAR(255) | Dream destination |
| `email` | VARCHAR(255) | Optional email for community |
| `created_at` | TIMESTAMP | When dream was submitted |
| `expires_at` | TIMESTAMP | Automatic expiration (30 days) |

### Stations Table

European train station data with search capabilities.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `external_id` | VARCHAR(255) | Unique external reference |
| `name` | VARCHAR(255) | Station name |
| `country` | VARCHAR(2) | ISO country code |
| `city` | VARCHAR(255) | City name |
| `lat` / `lng` | DECIMAL | GPS coordinates |
| `searchable` | TEXT | Pre-processed search text |

## Security Features

### Row Level Security (RLS)

- **Dreams**: Public read access to active dreams, public insert with validation
- **Stations**: Public read access to active stations only
- **Cleanup Log**: Service account access only

### Data Validation

- Email format validation
- Geographic bounds checking for Europe
- Required field validation
- Coordinate range validation

## Performance Optimizations

### Indexes

- **Dreams**: Created date, expiration date, origin station, destination city
- **Stations**: Search text (trigram), country, coordinates, name
- **Combined**: Optimized for common query patterns

### Automatic Cleanup

- Expired dreams are automatically removed
- Cleanup function tracks operations
- Can be scheduled to run daily

## API Endpoints

The database supports these API operations:

- `GET /api/dreams` - Retrieve active dreams
- `POST /api/dreams` - Submit new dream
- `GET /api/stations?q=search` - Search stations
- `GET /api/stats` - Platform statistics

## Testing the Setup

### 1. Test Database Connection

```bash
npm run test:db
```

### 2. Test API Endpoints

```bash
# Test dreams endpoint
curl "http://localhost:3000/api/dreams"

# Test stations search
curl "http://localhost:3000/api/stations?q=amsterdam"

# Test stats
curl "http://localhost:3000/api/stats"
```

### 3. Submit Test Dream

```bash
curl -X POST "http://localhost:3000/api/dreams" \
  -H "Content-Type: application/json" \
  -d '{
    "dreamer_name": "Test User",
    "origin_station": "Amsterdam Centraal",
    "destination_city": "Barcelona beach sunrise"
  }'
```

## Monitoring and Maintenance

### Database Statistics

Use the built-in views for monitoring:

```sql
-- View active dreams statistics
SELECT * FROM dreams_stats;

-- View forming communities
SELECT * FROM communities_forming;
```

### Cleanup Operations

Monitor cleanup operations:

```sql
SELECT * FROM cleanup_log ORDER BY cleaned_at DESC LIMIT 10;
```

### Manual Cleanup

Force cleanup of expired dreams:

```sql
SELECT cleanup_expired_dreams();
```

## Troubleshooting

### Connection Issues

1. **Verify credentials**: Check `.env.local` has correct Supabase URL and key
2. **Network access**: Ensure no firewall blocking Supabase
3. **Project status**: Verify Supabase project is active and not paused

### Schema Issues

1. **RLS policies**: If queries fail, check Row Level Security policies
2. **Missing tables**: Re-run the schema creation script
3. **Index problems**: Check if indexes were created successfully

### Import Issues

1. **Data format**: Ensure station data matches expected JSON format
2. **Coordinates**: Verify all coordinates are within Europe bounds
3. **Duplicates**: Script handles duplicates via `external_id` unique constraint

### Performance Issues

1. **Query optimization**: Use `EXPLAIN ANALYZE` to check query plans
2. **Index usage**: Monitor index usage statistics
3. **Connection pooling**: Consider connection pooling for high traffic

## Advanced Configuration

### Custom Cleanup Schedule

Set up a daily cleanup job using Supabase cron (if available):

```sql
-- Schedule daily cleanup at 2 AM
SELECT cron.schedule('cleanup-expired-dreams', '0 2 * * *', 'SELECT cleanup_expired_dreams();');
```

### Monitoring Alerts

Set up alerts for:
- Database storage usage
- Query performance
- Failed cleanup operations
- Unusual traffic patterns

### Backup Strategy

1. **Automatic backups**: Supabase provides automatic backups
2. **Export data**: Regular exports of critical data
3. **Point-in-time recovery**: Available in Supabase Pro tier

## Migration Guide

For future schema changes, follow these steps:

1. Create new migration file: `scripts/sql/02_migration_name.sql`
2. Test migration on staging database
3. Apply migration to production during low traffic
4. Update application code as needed
5. Monitor for issues post-migration

## Support

For database-related issues:

1. Check this documentation
2. Review Supabase documentation
3. Check application logs
4. Contact support with specific error messages

---

**Next Steps**: After database setup, proceed to [Phase 3: Serverless API Functions](../docs/API_SETUP.md)