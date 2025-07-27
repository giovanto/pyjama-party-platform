/**
 * Zod Validation Schemas for API Endpoints
 * Provides consistent validation for all API requests and responses
 */

import { z } from 'zod';
import { SUPPORTED_LANGUAGES } from '@/types/api';

// Base validation schemas
export const SupportedLanguageSchema = z.enum(SUPPORTED_LANGUAGES);

export const PlaceTypeSchema = z.enum([
  'destination', 'station', 'cultural', 'nature', 'coastal', 'urban', 'poi'
]);

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180)
});

export const EmailSchema = z.string().email().optional();

// Multilingual content schema
export const MultilingualContentSchema = z.record(
  z.string(),
  z.object({
    name: z.string().optional(),
    brief_desc: z.string().optional(),
    longer_desc: z.string().optional()
  }).catchall(z.string().optional())
);

// Places API validation schemas

export const PlacesSearchQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
  lang: SupportedLanguageSchema.default('en'),
  country: z.string().min(2).max(100).optional(),
  type: PlaceTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(1).max(1000).default(100).optional()
}).refine(
  (data) => {
    // If lat is provided, lon must also be provided and vice versa
    const hasLat = data.lat !== undefined;
    const hasLon = data.lon !== undefined;
    return hasLat === hasLon;
  },
  {
    message: "Both latitude and longitude must be provided for proximity search",
    path: ["lat", "lon"]
  }
);

export const PlaceDetailsQuerySchema = z.object({
  lang: SupportedLanguageSchema.default('en'),
  include_related: z.coerce.boolean().default(true),
  include_stations: z.coerce.boolean().default(true),
  include_routes: z.coerce.boolean().default(true)
});

export const PlaceUpdateSchema = z.object({
  content: MultilingualContentSchema.optional(),
  place_type: PlaceTypeSchema.optional(),
  priority_score: z.number().int().min(1).max(10).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
  lat_lon_tolerance: z.number().min(0.1).max(50).optional(),
  place_image: z.string().url().nullable().optional(),
  image_attribution: z.string().max(500).nullable().optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided for update" }
);

// Dreams API validation schemas

export const DreamSubmissionSchema = z.object({
  from: z.string().min(1).max(255).trim(),
  to: z.string().min(1).max(255).trim(),
  dreamerName: z.string().min(1).max(100).trim(),
  email: EmailSchema,
  why: z.string().min(10).max(2000).trim(),
  routeType: z.enum(['night_train', 'day_train', 'bus', 'mixed']).default('night_train'),
  travelPurpose: z.string().max(100).optional()
}).refine(
  (data) => data.from !== data.to,
  {
    message: "Origin and destination must be different",
    path: ["to"]
  }
);

export const DreamsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  country: z.string().min(2).max(100).optional(),
  route_type: z.enum(['night_train', 'day_train', 'bus', 'mixed']).optional(),
  status: z.enum(['submitted', 'reviewed', 'featured']).optional()
});

// Pyjama Party API validation schemas

export const PyjamaPartySubmissionSchema = z.object({
  stationName: z.string().min(1).max(255).trim(),
  city: z.string().min(1).max(100).trim(),
  country: z.string().min(2).max(100).trim(),
  partyDate: z.string().datetime(),
  organizerName: z.string().min(1).max(100).trim(),
  organizerEmail: z.string().email(),
  description: z.string().max(2000).optional()
}).refine(
  (data) => {
    const partyDate = new Date(data.partyDate);
    const now = new Date();
    return partyDate > now;
  },
  {
    message: "Party date must be in the future",
    path: ["partyDate"]
  }
);

// Statistics and content validation schemas

export const StatsQuerySchema = z.object({
  include_dreams: z.coerce.boolean().default(true),
  include_parties: z.coerce.boolean().default(true),
  include_routes: z.coerce.boolean().default(true),
  time_range: z.enum(['week', 'month', 'quarter', 'year', 'all']).default('all')
});

export const ContentQuerySchema = z.object({
  content_key: z.string().min(1).max(200),
  lang: SupportedLanguageSchema.default('en'),
  published_only: z.coerce.boolean().default(true)
});

// Response validation schemas (for API consistency)

export const PlaceSchema = z.object({
  place_id: z.string(),
  name: z.string(),
  brief_description: z.string(),
  longer_description: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  place_type: PlaceTypeSchema,
  priority_score: z.number().int(),
  tags: z.array(z.string()),
  image_url: z.string().nullable(),
  image_attribution: z.string().nullable(),
  distance_km: z.number().optional()
});

export const PlacesSearchResponseSchema = z.object({
  places: z.array(PlaceSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
  language: SupportedLanguageSchema,
  search_query: z.string().nullable(),
  proximity_search: z.object({
    center: CoordinatesSchema,
    radius_km: z.number()
  }).optional()
});

export const StationSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  country: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country_code: z.string().optional(),
  station_type: z.string().optional(),
  facilities: z.record(z.any()).optional(),
  accessibility: z.record(z.any()).optional(),
  distance_km: z.number().optional()
});

export const RouteConnectionSchema = z.object({
  route_id: z.string(),
  route_name: z.string(),
  from_place: z.object({
    place_id: z.string(),
    name: z.string()
  }),
  to_place: z.object({
    place_id: z.string(),
    name: z.string()
  }),
  demand_score: z.number(),
  exists_currently: z.boolean(),
  service_type: z.string().optional(),
  advocacy_priority: z.enum(['high', 'medium', 'low']),
  total_dreams: z.number().int()
});

// Error response schema
export const ApiErrorSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
  code: z.string().optional(),
  field: z.string().optional()
});

// Success response schema
export const ApiSuccessSchema = z.object({
  success: z.literal(true),
  data: z.any().optional(),
  message: z.string().optional()
});

// Validation helper functions

export function validatePlacesSearchQuery(query: any) {
  try {
    return {
      success: true,
      data: PlacesSearchQuerySchema.parse(query)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Validation failed'
    };
  }
}

export function validatePlaceDetailsQuery(query: any) {
  try {
    return {
      success: true,
      data: PlaceDetailsQuerySchema.parse(query)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Validation failed'
    };
  }
}

export function validateDreamSubmission(data: any) {
  try {
    return {
      success: true,
      data: DreamSubmissionSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Validation failed'
    };
  }
}

export function validatePyjamaPartySubmission(data: any) {
  try {
    return {
      success: true,
      data: PyjamaPartySubmissionSchema.parse(data)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof z.ZodError ? error.issues : 'Validation failed'
    };
  }
}

export function validatePaginationParams(limit?: string | number, offset?: string | number): {
  limit: number;
  offset: number;
} {
  const parsedLimit = typeof limit === 'string' ? parseInt(limit) : (limit || 50);
  const parsedOffset = typeof offset === 'string' ? parseInt(offset) : (offset || 0);

  return {
    limit: Math.min(Math.max(parsedLimit, 1), 100),
    offset: Math.max(parsedOffset, 0)
  };
}

// Sanitization helpers

export function sanitizeStringInput(input: string, maxLength: number = 200): string {
  return input.trim().substring(0, maxLength);
}

export function sanitizeSearchQuery(query: string): string {
  // Remove special characters that might cause issues in database queries
  return query
    .trim()
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .substring(0, 200);
}

export function sanitizeCoordinates(lat: string | number, lon: string | number): { lat: number; lon: number } | null {
  const parsedLat = typeof lat === 'string' ? parseFloat(lat) : lat;
  const parsedLon = typeof lon === 'string' ? parseFloat(lon) : lon;

  if (isNaN(parsedLat) || isNaN(parsedLon)) {
    return null;
  }

  if (parsedLat < -90 || parsedLat > 90 || parsedLon < -180 || parsedLon > 180) {
    return null;
  }

  return { lat: parsedLat, lon: parsedLon };
}

// Rate limiting validation (for use with rate limiting middleware)
export const RateLimitConfigSchema = z.object({
  windowMs: z.number().int().min(1000), // Minimum 1 second window
  max: z.number().int().min(1), // Minimum 1 request
  message: z.string().optional(),
  standardHeaders: z.boolean().default(true),
  legacyHeaders: z.boolean().default(false)
});

// Configuration for different endpoints
export const API_RATE_LIMITS = {
  search: { windowMs: 60000, max: 100 }, // 100 requests per minute
  details: { windowMs: 60000, max: 200 }, // 200 requests per minute
  dreams: { windowMs: 300000, max: 10 }, // 10 dreams per 5 minutes
  parties: { windowMs: 600000, max: 5 }, // 5 party submissions per 10 minutes
  default: { windowMs: 60000, max: 50 } // 50 requests per minute default
} as const;