/**
 * European Train Stations Data Import Script
 * 
 * This script imports European train station data into the Supabase database.
 * It handles data validation, transformation, and idempotent imports.
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
config({ path: '.env.local' });
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CONFIG = {
  batchSize: 100,
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
};

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

/**
 * Load and validate environment variables
 */
function validateEnvironment() {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Load station data from JSON file
 */
function loadStationData() {
  // Try different possible locations for the data file
  const possiblePaths = [
    join(__dirname, '../data/european_stations.json'),
    join(__dirname, '../../data/european_stations.json'),
    join(__dirname, '../../../data/european_stations.json'),
    join(__dirname, 'data/european_stations.json')
  ];
  
  let dataPath = null;
  for (const path of possiblePaths) {
    if (existsSync(path)) {
      dataPath = path;
      break;
    }
  }
  
  if (!dataPath) {
    throw new Error(`Station data file not found. Searched paths: ${possiblePaths.join(', ')}`);
  }
  
  console.log(`📁 Loading station data from: ${dataPath}`);
  
  try {
    const rawData = readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    if (!data.stations || !Array.isArray(data.stations)) {
      throw new Error('Invalid data format: expected { stations: Array }');
    }
    
    return data.stations;
  } catch (error) {
    throw new Error(`Failed to load station data: ${error.message}`);
  }
}

/**
 * Validate and transform station data
 */
function validateAndTransformStation(station, index) {
  const errors = [];
  
  // Required fields validation
  if (!station.id) errors.push('missing id');
  if (!station.name || station.name.trim().length < 2) errors.push('invalid name');
  if (!station.country || station.country.length !== 2) errors.push('invalid country code');
  if (!station.country_name || station.country_name.trim().length < 2) errors.push('invalid country name');
  if (typeof station.lat !== 'number' || station.lat < -90 || station.lat > 90) errors.push('invalid latitude');
  
  // Handle both lng and lon field names
  const longitude = station.lng || station.lon;
  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) errors.push('invalid longitude');
  
  // Europe bounds validation
  if (station.lat < 34.0 || station.lat > 72.0 || longitude < -25.0 || longitude > 45.0) {
    errors.push('coordinates outside Europe bounds');
  }
  
  if (errors.length > 0) {
    throw new Error(`Station ${index}: ${errors.join(', ')}`);
  }
  
  // Build searchable text
  const searchableText = [
    station.name,
    station.city || '',
    station.country_name,
    station.country
  ].filter(Boolean).join(' ').toLowerCase();
  
  // Transform to database format
  return {
    external_id: station.id.toString(),
    name: station.name.trim(),
    country: station.country.toUpperCase(),
    country_name: station.country_name.trim(),
    city: station.city?.trim() || null,
    lat: parseFloat(station.lat.toFixed(8)),
    lng: parseFloat(longitude.toFixed(8)),
    station_type: station.type || 'station',
    searchable: searchableText,
    is_active: true
  };
}

/**
 * Check if stations already exist
 */
async function checkExistingStations(externalIds) {
  const { data, error } = await supabase
    .from('stations')
    .select('external_id')
    .in('external_id', externalIds);
  
  if (error) {
    throw new Error(`Failed to check existing stations: ${error.message}`);
  }
  
  return new Set(data.map(station => station.external_id));
}

/**
 * Import stations in batches with retry logic
 */
async function importStationsBatch(stations, batchNumber, totalBatches) {
  const startIndex = (batchNumber - 1) * CONFIG.batchSize;
  const endIndex = Math.min(startIndex + CONFIG.batchSize, stations.length);
  const batch = stations.slice(startIndex, endIndex);
  
  console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} stations)`);
  
  let retries = 0;
  while (retries < CONFIG.maxRetries) {
    try {
      const { data, error } = await supabase
        .from('stations')
        .upsert(batch, { 
          onConflict: 'external_id',
          ignoreDuplicates: false 
        })
        .select('external_id');
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log(`   ✅ Batch ${batchNumber} completed: ${data.length} stations processed`);
      return data.length;
      
    } catch (error) {
      retries++;
      console.log(`   ⚠️  Batch ${batchNumber} failed (attempt ${retries}/${CONFIG.maxRetries}): ${error.message}`);
      
      if (retries < CONFIG.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * retries));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Main import function
 */
async function importStations() {
  console.log('🚂 Starting European Train Stations Import');
  console.log('=' .repeat(50));
  
  try {
    // Validate environment
    validateEnvironment();
    console.log('✅ Environment variables validated');
    
    // Load station data
    const rawStations = loadStationData();
    console.log(`📊 Loaded ${rawStations.length} stations from file`);
    
    // Validate and transform stations
    const validStations = [];
    const errors = [];
    
    for (let i = 0; i < rawStations.length; i++) {
      try {
        const transformedStation = validateAndTransformStation(rawStations[i], i + 1);
        validStations.push(transformedStation);
      } catch (error) {
        errors.push(error.message);
      }
    }
    
    console.log(`✅ Validated ${validStations.length} stations`);
    if (errors.length > 0) {
      console.log(`⚠️  Found ${errors.length} validation errors:`);
      errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more errors`);
      }
    }
    
    if (validStations.length === 0) {
      throw new Error('No valid stations to import');
    }
    
    // Check existing stations
    const externalIds = validStations.map(s => s.external_id);
    const existingIds = await checkExistingStations(externalIds);
    console.log(`📋 Found ${existingIds.size} existing stations in database`);
    
    // Import in batches
    const totalBatches = Math.ceil(validStations.length / CONFIG.batchSize);
    let totalImported = 0;
    
    for (let i = 1; i <= totalBatches; i++) {
      const imported = await importStationsBatch(validStations, i, totalBatches);
      totalImported += imported;
      
      // Add delay between batches to avoid rate limiting
      if (i < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log('=' .repeat(50));
    console.log('🎉 Import completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Total stations in file: ${rawStations.length}`);
    console.log(`   - Valid stations: ${validStations.length}`);
    console.log(`   - Validation errors: ${errors.length}`);
    console.log(`   - Stations processed: ${totalImported}`);
    console.log(`   - Previously existing: ${existingIds.size}`);
    console.log(`   - New stations added: ${totalImported - existingIds.size}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run the import if this script is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  importStations();
}

export { importStations };