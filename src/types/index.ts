// V1 data types ported to TypeScript

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
  email?: string;
  email_verified?: boolean;
  created_at: string;
  expires_at?: string;
}

export interface Station {
  id?: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  type?: string;
}

export interface Destination {
  name: string;
  country: string;
  lat: number;
  lng: number;
}

export interface Stats {
  total_dreams?: number;
  active_stations?: number;
}

export interface DreamFormData {
  dreamerName: string;
  originStation: string;
  destinationCity: string;
  email?: string;
}

export interface DreamSubmissionResponse {
  id: string;
  message: string;
  community_message?: string;
}

export interface CommunityInfo {
  station: string;
  dreamers_count: number;
  message: string;
  discord_invite: string;
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  version: string;
}

export interface TimeLeft {
  days: number;
}

export interface ApiError {
  error: string;
  status?: number;
}

// Interview Mode Types (Phase 2C)
export interface InterviewDreamData {
  dreamerName: string;
  originStation: string;
  destinationCity: string;
  email?: string;
  why?: string;
  collectedBy?: string; // Volunteer identifier
  sessionId?: string; // For tracking volunteer sessions
  language: 'en' | 'de' | 'fr';
  source: 'interview';
}

export interface VolunteerSession {
  id: string;
  volunteerId: string;
  stationCode: string;
  language: 'en' | 'de' | 'fr';
  startTime: string;
  endTime?: string;
  submissionsCount: number;
  lastActivity: string;
}

export interface OfflineQueueItem {
  id: string;
  data: InterviewDreamData;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

export interface QRCodeRequest {
  stationCode: string;
  stationName: string;
  language: 'en' | 'de' | 'fr';
  volunteerId?: string;
  eventDate?: string;
}

export interface QRCodeResponse {
  id: string;
  qrCodeDataUrl: string;
  url: string;
  stationCode: string;
  expiresAt: string;
}

export interface BulkQRRequest {
  stations: Array<{
    code: string;
    name: string;
    country: string;
  }>;
  language: 'en' | 'de' | 'fr';
  eventDate: string;
  coordinatorEmail: string;
}

export interface VolunteerStats {
  sessionId: string;
  stationCode: string;
  submissionsToday: number;
  submissionsTotal: number;
  avgTimePerSubmission: number;
  lastSubmissionTime?: string;
  offlineQueueSize: number;
  targetSubmissions?: number;
}