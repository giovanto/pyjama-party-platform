/**
 * TypeScript Types and Interfaces
 * Centralized type definitions for the Pajama Party Platform
 */

// =====================================================
// Core Domain Types
// =====================================================

export interface Dream {
  id: string;
  dreamer_name: string;
  origin_station: string;
  origin_country?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_city: string;
  destination_country?: string;
  destination_lat?: number;
  destination_lng?: number;
  email_verified: boolean;
  created_at: string;
  expires_at: string;
}

export interface Station {
  id: string;
  external_id: string;
  name: string;
  country: string;
  country_name: string;
  city?: string;
  lat: number;
  lng: number;
  station_type: 'station' | 'stop' | 'halt' | 'junction';
  is_active: boolean;
}

export interface DreamSubmission {
  dreamer_name: string;
  origin_station: string;
  origin_country?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_city: string;
  destination_country?: string;
  destination_lat?: number;
  destination_lng?: number;
  email?: string;
}

// =====================================================
// Platform Statistics
// =====================================================

export interface PlatformStats {
  total_dreams: number;
  active_stations: number;
  communities_forming: number;
  countries_represented: number;
  dreams_today: number;
  dreams_this_week: number;
  top_destinations: TopDestination[];
  top_origin_stations: TopOriginStation[];
  geographic_distribution: GeographicDistribution[];
  recent_activity: RecentActivity[];
  last_updated: string;
}

export interface TopDestination {
  city: string;
  count: number;
}

export interface TopOriginStation {
  station: string;
  country: string;
  count: number;
}

export interface GeographicDistribution {
  country: string;
  country_name: string;
  dream_count: number;
}

export interface RecentActivity {
  timeframe: string;
  dream_count: number;
}

// =====================================================
// API Response Types
// =====================================================

export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface DreamsResponse {
  dreams: Dream[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  metadata: {
    timestamp: string;
    filters: {
      country: string | null;
      station: string | null;
    };
  };
}

export interface StationsResponse {
  stations: Station[];
  metadata: {
    query: {
      term: string;
      country: string | null;
      sanitized_term: string;
    };
    results: {
      count: number;
      countries: Record<string, number>;
      station_types: Record<string, number>;
    };
    timestamp: string;
  };
}

export interface DreamSubmissionResponse {
  success: boolean;
  dream: Dream;
  community_message?: string;
  message: string;
  timestamp: string;
}

// =====================================================
// Form and UI Types
// =====================================================

export interface FormErrors {
  [key: string]: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

export interface SearchFilters {
  country?: string;
  station?: string;
  limit?: number;
  offset?: number;
}

export interface StationSearchOptions {
  country?: string;
  limit?: number;
}

// =====================================================
// Map and Geographic Types
// =====================================================

export interface MapFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString';
    coordinates: number[] | number[][];
  };
  properties: {
    id: string;
    type: 'dream' | 'station' | 'route';
    [key: string]: any;
  };
}

export interface MapSource {
  type: 'FeatureCollection';
  features: MapFeature[];
}

export interface MapViewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// =====================================================
// Component Props Types
// =====================================================

export interface DreamFormProps {
  onSubmitSuccess?: (response: DreamSubmissionResponse) => void;
  onSubmitError?: (error: Error) => void;
  onFieldChange?: (field: string, value: string) => void;
  initialData?: Partial<DreamSubmission>;
  disabled?: boolean;
}

export interface StationSearchProps {
  id?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  onStationSelect: (station: Station | null) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export interface MapProps {
  dreams?: Dream[];
  stations?: Station[];
  selectedDream?: Dream | null;
  selectedStation?: Station | null;
  onDreamSelect?: (dream: Dream | null) => void;
  onStationSelect?: (station: Station | null) => void;
  viewport?: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  className?: string;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  loading?: boolean;
  className?: string;
}

// =====================================================
// Hook Return Types
// =====================================================

export interface UseDreamsReturn {
  dreams: Dream[];
  isLoading: boolean;
  error: string | null;
  addDream: (dream: Partial<Dream>) => Promise<void>;
  refresh: () => Promise<void>;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export interface UseStationsReturn {
  stations: Station[];
  isLoading: boolean;
  error: string | null;
  searchStations: (query: string, options?: StationSearchOptions) => Promise<void>;
  clearStations: () => void;
}

export interface UseStatsReturn {
  stats: PlatformStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: string | null;
}

export interface UseFormReturn<T> {
  data: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
  updateField: (field: keyof T, value: any) => void;
  updateData: (newData: Partial<T>) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  reset: (newData?: Partial<T>) => void;
  submit: (submitFn: (data: T) => Promise<void>) => Promise<void>;
}

// =====================================================
// Context Types
// =====================================================

export interface AppContextValue {
  dreams: Dream[];
  stats: PlatformStats | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addDream: (dream: DreamSubmission) => Promise<DreamSubmissionResponse>;
  searchStations: (query: string, options?: StationSearchOptions) => Promise<Station[]>;
}

// =====================================================
// Theme and Styling Types
// =====================================================

export type Theme = 'light' | 'dark' | 'auto';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

// =====================================================
// Error Types
// =====================================================

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: any;
  timestamp?: string;
}

export interface FormValidationError extends Error {
  field: string;
  code: string;
}

// =====================================================
// Configuration Types
// =====================================================

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  map: {
    accessToken: string;
    style: string;
    defaultViewport: MapViewport;
    bounds: MapBounds;
  };
  features: {
    emailCollection: boolean;
    communityFeatures: boolean;
    analytics: boolean;
  };
}

// =====================================================
// Utility Types
// =====================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
  field: keyof T;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================================================
// Event Types
// =====================================================

export interface DreamEvent {
  type: 'dream_added' | 'dream_updated' | 'dream_deleted';
  dream: Dream;
  timestamp: string;
}

export interface StationEvent {
  type: 'station_selected' | 'station_searched';
  station?: Station;
  query?: string;
  timestamp: string;
}

export interface MapEvent {
  type: 'viewport_changed' | 'feature_clicked' | 'feature_hovered';
  viewport?: MapViewport;
  feature?: MapFeature;
  timestamp: string;
}

// =====================================================
// Constants
// =====================================================

export const VALIDATION_RULES = {
  dreamer_name: {
    required: true,
    minLength: 2,
    maxLength: 255,
    pattern: /^[a-zA-ZÀ-ÿ\s\-'\.]+$/,
  },
  origin_station: {
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  destination_city: {
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  coordinates: {
    latRange: [-90, 90] as const,
    lngRange: [-180, 180] as const,
  },
} as const;

export const API_ENDPOINTS = {
  dreams: '/api/dreams',
  stations: '/api/stations',
  stats: '/api/stats',
  cleanup: '/api/cleanup',
} as const;

export const MAP_CONFIG = {
  defaultViewport: {
    latitude: 52.5,
    longitude: 13.4,
    zoom: 4,
  },
  europeBounds: {
    north: 72.0,
    south: 34.0,
    east: 45.0,
    west: -25.0,
  },
  styles: {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
  },
} as const;

export const COUNTRIES = {
  'AT': 'Austria',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'CZ': 'Czech Republic',
  'DE': 'Germany',
  'DK': 'Denmark',
  'ES': 'Spain',
  'FI': 'Finland',
  'FR': 'France',
  'GB': 'United Kingdom',
  'IT': 'Italy',
  'NL': 'Netherlands',
  'NO': 'Norway',
  'PL': 'Poland',
  'PT': 'Portugal',
  'SE': 'Sweden',
} as const;

export type CountryCode = keyof typeof COUNTRIES;

// =====================================================
// Layout Component Types
// =====================================================

export interface HeaderProps {
  className?: string;
  showStats?: boolean;
  onNavigate?: (section: string) => void;
}

export interface CommunityMessageProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'celebration';
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export interface CommunityStatsProps {
  className?: string;
  showTitle?: boolean;
  layout?: 'horizontal' | 'vertical';
}