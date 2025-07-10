import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase configuration missing. Database features will be disabled.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export interface Dream {
  id: string;
  from_station: string;
  to_station: string;
  dreamer_name: string;
  dreamer_email: string;
  why_important: string;
  created_at: string;
  from_coordinates?: [number, number];
  to_coordinates?: [number, number];
}

export interface Station {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
  created_at: string;
}

export interface PajamaParty {
  id: string;
  station_name: string;
  city: string;
  country: string;
  date: string;
  organizer_name: string;
  organizer_email: string;
  description: string;
  attendees_count: number;
  created_at: string;
}