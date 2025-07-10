# API Documentation

This document describes the RESTful API endpoints for the Pajama Party Platform.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.vercel.app/api`

## Authentication

All endpoints are currently public and do not require authentication. Rate limiting is applied per IP address.

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## Common Response Headers

All API responses include these headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
X-Request-ID: req_1234567890_abcdef
X-Powered-By: Pajama Party Platform
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": ["Specific error details (development only)"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `408` - Request Timeout
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Endpoints

### 1. Dreams API

#### GET /api/dreams

Retrieve active dreams with pagination and filtering.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Number of results (1-1000, default: 1000) |
| `offset` | integer | No | Pagination offset (default: 0) |
| `country` | string | No | Filter by origin country code (ISO 3166-1 alpha-2) |
| `station` | string | No | Filter by origin station name (partial match) |

**Example Request:**
```bash
GET /api/dreams?limit=10&offset=0&country=DE
```

**Response:**
```json
{
  "dreams": [
    {
      "id": "uuid-here",
      "dreamer_name": "Maria",
      "origin_station": "Berlin Hauptbahnhof",
      "origin_country": "DE",
      "origin_lat": 52.5251,
      "origin_lng": 13.3691,
      "destination_city": "Barcelona beach sunrise",
      "destination_country": "ES",
      "destination_lat": 41.3851,
      "destination_lng": 2.1734,
      "email_verified": false,
      "created_at": "2024-01-01T12:00:00.000Z",
      "expires_at": "2024-01-31T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "filters": {
      "country": "DE",
      "station": null
    }
  }
}
```

#### POST /api/dreams

Submit a new dream.

**Request Body:**
```json
{
  "dreamer_name": "Maria",
  "origin_station": "Berlin Hauptbahnhof",
  "origin_country": "DE",
  "origin_lat": 52.5251,
  "origin_lng": 13.3691,
  "destination_city": "Barcelona beach sunrise",
  "destination_country": "ES",
  "destination_lat": 41.3851,
  "destination_lng": 2.1734,
  "email": "maria@example.com"
}
```

**Required Fields:**
- `dreamer_name` (string, 2-255 chars, letters/spaces/hyphens only)
- `origin_station` (string, 2-255 chars)
- `destination_city` (string, 2-255 chars)

**Optional Fields:**
- `origin_country` (string, ISO 3166-1 alpha-2)
- `origin_lat`/`origin_lng` (number, valid coordinates)
- `destination_country` (string, ISO 3166-1 alpha-2)
- `destination_lat`/`destination_lng` (number, valid coordinates)
- `email` (string, valid email format)

**Response:**
```json
{
  "success": true,
  "dream": {
    "id": "uuid-here",
    "dreamer_name": "Maria",
    "origin_station": "Berlin Hauptbahnhof",
    "destination_city": "Barcelona beach sunrise",
    "created_at": "2024-01-01T12:00:00.000Z",
    "expires_at": "2024-01-31T12:00:00.000Z"
  },
  "community_message": "💫 Great! 2 dreamers from Berlin Hauptbahnhof are planning pajama parties! You're not alone! 🤝",
  "message": "Dream added successfully! Your pajama party adventure awaits! 🚂✨",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 2. Stations API

#### GET /api/stations

Search European train stations.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (2-100 chars) |
| `country` | string | No | Filter by country code (ISO 3166-1 alpha-2) |
| `limit` | integer | No | Number of results (1-50, default: 20) |

**Example Request:**
```bash
GET /api/stations?q=amsterdam&country=NL&limit=5
```

**Response:**
```json
{
  "stations": [
    {
      "id": "uuid-here",
      "external_id": "amsterdam-centraal",
      "name": "Amsterdam Centraal",
      "country": "NL",
      "country_name": "Netherlands",
      "city": "Amsterdam",
      "lat": 52.3791,
      "lng": 4.9003,
      "station_type": "station",
      "is_active": true
    }
  ],
  "metadata": {
    "query": {
      "term": "amsterdam",
      "country": "NL",
      "sanitized_term": "amsterdam"
    },
    "results": {
      "count": 1,
      "countries": {
        "NL": 1
      },
      "station_types": {
        "station": 1
      }
    },
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

---

### 3. Statistics API

#### GET /api/stats

Get platform statistics.

**Parameters:** None

**Response:**
```json
{
  "total_dreams": 1337,
  "active_stations": 89,
  "communities_forming": 23,
  "countries_represented": 15,
  "dreams_today": 5,
  "dreams_this_week": 42,
  "top_destinations": [
    {
      "city": "Barcelona beach sunrise",
      "count": 15
    },
    {
      "city": "Paris café morning",
      "count": 12
    }
  ],
  "top_origin_stations": [
    {
      "station": "Berlin Hauptbahnhof",
      "country": "DE",
      "count": 8
    },
    {
      "station": "Amsterdam Centraal",
      "country": "NL",
      "count": 6
    }
  ],
  "geographic_distribution": [
    {
      "country": "DE",
      "country_name": "Germany",
      "dream_count": 25
    },
    {
      "country": "NL",
      "country_name": "Netherlands",
      "dream_count": 18
    }
  ],
  "recent_activity": [
    {
      "timeframe": "2024-01-01",
      "dream_count": 5
    },
    {
      "timeframe": "2024-01-02",
      "dream_count": 3
    }
  ],
  "last_updated": "2024-01-01T12:00:00.000Z"
}
```

**Cache Headers:**
- `Cache-Control: public, max-age=300, stale-while-revalidate=600`
- `X-Cache: HIT` or `X-Cache: MISS`

---

### 4. Cleanup API (Internal)

#### GET /api/cleanup

Check cleanup service health (monitoring endpoint).

**Response:**
```json
{
  "status": "healthy",
  "message": "Cleanup service is operational",
  "stats": {
    "total_active_dreams": 1337,
    "total_expired_dreams": 256,
    "oldest_active_dream": "2024-01-01T12:00:00.000Z",
    "newest_active_dream": "2024-01-15T18:30:00.000Z"
  },
  "timestamp": "2024-01-15T20:00:00.000Z"
}
```

#### POST /api/cleanup

Execute cleanup of expired dreams (cron job only).

**Authentication:** Requires valid cron secret or Vercel cron headers.

**Response:**
```json
{
  "status": "success",
  "message": "Cleanup completed successfully",
  "cleanup_result": {
    "deleted_count": 42,
    "execution_time": 1250
  },
  "stats": {
    "before": {
      "total_active_dreams": 1337,
      "total_expired_dreams": 298
    },
    "after": {
      "total_active_dreams": 1337,
      "total_expired_dreams": 256
    }
  },
  "timestamp": "2024-01-15T02:00:00.000Z"
}
```

---

## Data Models

### Dream
```typescript
interface Dream {
  id: string;                    // UUID
  dreamer_name: string;          // 2-255 chars
  origin_station: string;        // 2-255 chars
  origin_country?: string;       // ISO 3166-1 alpha-2
  origin_lat?: number;           // -90 to 90
  origin_lng?: number;           // -180 to 180
  destination_city: string;      // 2-255 chars
  destination_country?: string;  // ISO 3166-1 alpha-2
  destination_lat?: number;      // -90 to 90
  destination_lng?: number;      // -180 to 180
  email_verified: boolean;       // Always false for public API
  created_at: string;            // ISO 8601 timestamp
  expires_at: string;            // ISO 8601 timestamp (30 days from creation)
}
```

### Station
```typescript
interface Station {
  id: string;              // UUID
  external_id: string;     // Unique external reference
  name: string;            // Station name
  country: string;         // ISO 3166-1 alpha-2
  country_name: string;    // Full country name
  city?: string;           // City name
  lat: number;             // Latitude (-90 to 90)
  lng: number;             // Longitude (-180 to 180)
  station_type: string;    // 'station', 'stop', 'halt', 'junction'
  is_active: boolean;      // Always true for public API
}
```

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch dreams
const response = await fetch('/api/dreams?limit=10');
const data = await response.json();

// Submit a dream
const dream = {
  dreamer_name: 'Emma',
  origin_station: 'Amsterdam Centraal',
  destination_city: 'Venice canal morning'
};

const response = await fetch('/api/dreams', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(dream),
});

// Search stations
const response = await fetch('/api/stations?q=berlin&limit=5');
const stations = await response.json();

// Get statistics
const response = await fetch('/api/stats');
const stats = await response.json();
```

### cURL Examples

```bash
# Get dreams
curl "https://your-domain.vercel.app/api/dreams?limit=5"

# Submit dream
curl -X POST "https://your-domain.vercel.app/api/dreams" \
  -H "Content-Type: application/json" \
  -d '{
    "dreamer_name": "Emma",
    "origin_station": "Amsterdam Centraal",
    "destination_city": "Venice canal morning"
  }'

# Search stations
curl "https://your-domain.vercel.app/api/stations?q=berlin&limit=5"

# Get stats
curl "https://your-domain.vercel.app/api/stats"
```

---

## Error Handling

### Validation Errors (400)

```json
{
  "error": "Validation failed",
  "message": "Please check your input data",
  "details": [
    "dreamer_name must be at least 2 characters",
    "email format is invalid"
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Rate Limiting (429)

```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again later.",
  "retryAfter": 900,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Server Errors (500)

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Performance and Caching

- **Statistics API**: Cached for 5 minutes
- **Search API**: No caching (real-time results)
- **Dreams API**: No caching (real-time results)
- **Database**: Optimized with indexes for fast queries
- **Rate Limiting**: In-memory store (production should use Redis)

## Security

- **CORS**: Enabled for all origins
- **Headers**: Security headers on all responses
- **Validation**: Input validation and sanitization
- **RLS**: Row Level Security enabled in database
- **Rate Limiting**: Per-IP protection against abuse
- **Data Privacy**: Email addresses never exposed in responses

---

## Monitoring

The API provides several monitoring endpoints:

- `GET /api/stats` - Platform statistics
- `GET /api/cleanup` - Cleanup service health
- Response headers include `X-Request-ID` for tracking

For production monitoring, consider:
- Uptime monitoring on `/api/stats`
- Error rate monitoring via logs
- Performance monitoring via response times
- Database health monitoring

---

## Support

For API support:
1. Check this documentation
2. Review error messages and status codes
3. Check rate limiting headers
4. Verify request format and required fields
5. Contact support with specific error details