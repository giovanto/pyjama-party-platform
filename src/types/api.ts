/**
 * API Types and Interfaces for European Night Train Advocacy Platform
 * Shared types for consistent API responses and request validation
 */

// Supported languages for the platform
export const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'it', 'nl', 'da', 'sv', 'no'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Place Types
export type PlaceType = 'destination' | 'station' | 'cultural' | 'nature' | 'coastal' | 'urban' | 'poi';

// Common multilingual content structure
export interface MultilingualContent {
  [language: string]: {
    name?: string;
    brief_desc?: string;
    longer_desc?: string;
    [key: string]: string | undefined;
  };
}

// Geographic coordinate
export interface Coordinates {
  lat: number;
  lon: number;
}

// Base place interface
export interface Place {
  place_id: string;
  name: string;
  brief_description: string;
  longer_description: string;
  country: string;
  latitude: number;
  longitude: number;
  place_type: PlaceType;
  priority_score: number;
  tags: string[];
  image_url: string | null;
  image_attribution: string | null;
}

// Extended place details with additional information
export interface PlaceDetails extends Place {
  tolerance: number;
  multilingual_content: MultilingualContent;
  related_places?: Place[];
  nearby_stations?: Station[];
  route_connections?: RouteConnection[];
  source_info: {
    type: string;
    import_date?: string;
    version?: string;
  };
}

// Station interface
export interface Station {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  country_code?: string;
  station_type?: string;
  facilities?: Record<string, any>;
  accessibility?: Record<string, any>;
  distance_km?: number;
}

// Route connection interface
export interface RouteConnection {
  route_id: string;
  route_name: string;
  from_place: {
    place_id: string;
    name: string;
  };
  to_place: {
    place_id: string;
    name: string;
  };
  demand_score: number;
  exists_currently: boolean;
  service_type?: string;
  advocacy_priority: 'high' | 'medium' | 'low';
  total_dreams: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  metadata?: Record<string, any>;
}

// Places search request parameters
export interface PlacesSearchParams {
  q?: string;           // Search query
  lang?: SupportedLanguage;  // Language preference
  country?: string;     // Filter by country
  type?: PlaceType;     // Filter by place type
  limit?: number;       // Number of results (1-100)
  offset?: number;      // Pagination offset
  lat?: number;         // Center latitude for proximity search
  lon?: number;         // Center longitude for proximity search
  radius?: number;      // Search radius in kilometers
}

// Places search response
export interface PlacesSearchResponse {
  places: Place[];
  total: number;
  limit: number;
  offset: number;
  language: SupportedLanguage;
  search_query: string | null;
  proximity_search?: {
    center: Coordinates;
    radius_km: number;
  };
}

// Place details response
export interface PlaceDetailsResponse {
  place: PlaceDetails;
  metadata: {
    requested_language: SupportedLanguage;
    available_languages: string[];
    includes: {
      related_places: boolean;
      nearby_stations: boolean;
      route_connections: boolean;
    };
    last_updated: string;
  };
}

// Dream route interface (for existing API compatibility)
export interface DreamRoute {
  id: string;
  from_station: string;
  to_station: string;
  dreamer_name: string;
  dreamer_email: string;
  why_important: string;
  from_latitude?: number;
  from_longitude?: number;
  to_latitude?: number;
  to_longitude?: number;
  route_type?: string;
  travel_purpose?: string;
  estimated_demand?: number;
  status?: string;
  created_at: string;
}

// Dreams API request
export interface DreamSubmissionRequest {
  from: string;
  to: string;
  dreamerName: string;
  email?: string;
  why: string;
  routeType?: string;
  travelPurpose?: string;
}

// Dreams API response
export interface DreamsResponse {
  dreams: DreamRoute[];
  total: number;
  limit: number;
  offset: number;
}

// Pyjama party interface
export interface PyjamaParty {
  id: string;
  station_name: string;
  city: string;
  country: string;
  party_date: string;
  organizer_name: string;
  organizer_email: string;
  description?: string;
  attendees_count: number;
  status: 'planned' | 'confirmed' | 'cancelled';
  created_at: string;
}

// Statistics interface
export interface PlatformStats {
  total_dreams: number;
  total_stations: number;
  total_participants: number;
  critical_mass_stations: Station[];
  popular_routes: RouteConnection[];
  recent_activity: {
    dreams: DreamRoute[];
    parties: PyjamaParty[];
  };
}

// Error response interface
export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  field?: string;
}

// Success response interface
export interface ApiSuccess<T = any> {
  success: true;
  data?: T;
  message?: string;
}

// Content management interface
export interface Content {
  id: string;
  content_key: string;
  content_type: 'text' | 'markdown' | 'html';
  content: MultilingualContent;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Validation utilities
export class ApiValidation {
  static isValidLanguage(lang: string): lang is SupportedLanguage {
    return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
  }

  static isValidPlaceType(type: string): type is PlaceType {
    const validTypes: PlaceType[] = ['destination', 'station', 'cultural', 'nature', 'coastal', 'urban', 'poi'];
    return validTypes.includes(type as PlaceType);
  }

  static validateCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static sanitizeSearchQuery(query: string): string {
    return query.trim().substring(0, 200); // Limit length and trim whitespace
  }

  static validatePaginationParams(limit?: string | number, offset?: string | number): {
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
}

// Helper functions for multilingual content
export class MultilingualHelper {
  static getContent(
    content: MultilingualContent,
    language: SupportedLanguage,
    field: string,
    fallbackToEnglish: boolean = true
  ): string {
    // Try requested language first
    if (content[language]?.[field]) {
      return content[language][field] || '';
    }

    // Fallback to English if enabled
    if (fallbackToEnglish && content.en?.[field]) {
      return content.en[field] || '';
    }

    // Fallback to any available language
    for (const [, langContent] of Object.entries(content)) {
      if (langContent[field]) {
        return langContent[field] || '';
      }
    }

    return '';
  }

  static getAvailableLanguages(content: MultilingualContent): SupportedLanguage[] {
    return Object.keys(content).filter(lang => 
      SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)
    ) as SupportedLanguage[];
  }

  static createEmptyContent(): MultilingualContent {
    return {
      en: { name: '', brief_desc: '', longer_desc: '' }
    };
  }
}

// Geographic utilities
export class GeoUtils {
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static getBoundingBox(lat: number, lon: number, radiusKm: number) {
    const latRange = radiusKm / 111; // Rough conversion: 1 degree lat ≈ 111 km
    const lonRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    return {
      north: lat + latRange,
      south: lat - latRange,
      east: lon + lonRange,
      west: lon - lonRange
    };
  }

  static isValidCoordinate(lat: number, lon: number): boolean {
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180;
  }
}