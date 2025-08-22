#!/usr/bin/env tsx

/**
 * Import script for official Back-on-Track night train data
 * 
 * This script imports GTFS-style data from the official Back-on-Track night train database
 * into our Supabase database for use in the Pajama Party Platform.
 * 
 * Data source: /Users/giovi/Documents/Projects/Back-on-Track/Back-on-Track_night-train-data/data/latest/
 */

import { promises as fs } from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Configuration
const DATA_PATH = '/Users/giovi/Documents/Projects/Back-on-Track/Back-on-Track_night-train-data/data/latest';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ImportStats {
  file: string;
  records: number;
  success: boolean;
  error?: string;
  duration: number;
}

async function loadJsonFile(filename: string): Promise<any> {
  const filePath = path.join(DATA_PATH, filename);
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function importAgencies(data: any): Promise<ImportStats> {
  const start = Date.now();
  console.log('📋 Importing agencies...');
  
  try {
    // Convert object to array format for database insertion
    const agencies = Object.values(data).map((agency: any) => ({
      agency_id: agency.agency_id,
      agency_name: agency.agency_name,
      agency_url: agency.agency_url,
      agency_timezone: agency.agency_timezone,
      agency_lang: agency.agency_lang,
      agency_phone: agency.agency_phone || null,
      agency_fare_url: agency.agency_fare_url || null,
      agency_email: agency.agency_email || null,
      agency_name_romanized: agency.agency_name_romanized || null,
      agency_name_brand: agency.agency_name_brand || null,
      agency_state: agency.agency_state,
      agency_logo_url: agency.agency_logo_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Upsert agencies (insert or update on conflict)
    const { error } = await supabase
      .from('bot_agencies')
      .upsert(agencies, { 
        onConflict: 'agency_id',
        ignoreDuplicates: false 
      });

    if (error) throw error;

    return {
      file: 'agencies.json',
      records: agencies.length,
      success: true,
      duration: Date.now() - start
    };
  } catch (error) {
    return {
      file: 'agencies.json',
      records: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start
    };
  }
}

async function importRoutes(data: any): Promise<ImportStats> {
  const start = Date.now();
  console.log('🚂 Importing routes...');
  
  try {
    // Convert object to array format for database insertion
    const routes = Object.values(data).map((route: any) => ({
      route_id: route.route_id,
      agency_id: route.agency_id,
      route_short_name: route.route_short_name || null,
      route_long_name: route.route_long_name || null,
      route_desc: route.route_desc || null,
      route_type: route.route_type || 2, // Rail service
      route_url: route.route_url || null,
      route_color: route.route_color || null,
      route_text_color: route.route_text_color || null,
      route_sort_order: route.route_sort_order || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert in batches to handle large datasets
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < routes.length; i += batchSize) {
      const batch = routes.slice(i, i + batchSize);
      const { error } = await supabase
        .from('bot_routes')
        .upsert(batch, { 
          onConflict: 'route_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      totalInserted += batch.length;
      
      if (i % (batchSize * 10) === 0) {
        console.log(`  📊 Processed ${totalInserted}/${routes.length} routes...`);
      }
    }

    return {
      file: 'routes.json',
      records: routes.length,
      success: true,
      duration: Date.now() - start
    };
  } catch (error) {
    return {
      file: 'routes.json',
      records: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start
    };
  }
}

async function importStops(data: any): Promise<ImportStats> {
  const start = Date.now();
  console.log('🚉 Importing stops...');
  
  try {
    // Convert object to array format for database insertion
    const stops = Object.values(data).map((stop: any) => ({
      stop_id: stop.stop_id,
      stop_code: stop.stop_code || null,
      stop_name: stop.stop_name,
      stop_desc: stop.stop_desc || null,
      stop_lat: parseFloat(stop.stop_lat) || null,
      stop_lon: parseFloat(stop.stop_lon) || null,
      zone_id: stop.zone_id || null,
      stop_url: stop.stop_url || null,
      location_type: stop.location_type || 0,
      parent_station: stop.parent_station || null,
      stop_timezone: stop.stop_timezone || null,
      wheelchair_boarding: stop.wheelchair_boarding || 0,
      level_id: stop.level_id || null,
      platform_code: stop.platform_code || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert in batches
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < stops.length; i += batchSize) {
      const batch = stops.slice(i, i + batchSize);
      const { error } = await supabase
        .from('bot_stops')
        .upsert(batch, { 
          onConflict: 'stop_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;
      totalInserted += batch.length;
      
      if (i % (batchSize * 10) === 0) {
        console.log(`  📊 Processed ${totalInserted}/${stops.length} stops...`);
      }
    }

    return {
      file: 'stops.json',
      records: stops.length,
      success: true,
      duration: Date.now() - start
    };
  } catch (error) {
    return {
      file: 'stops.json',
      records: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - start
    };
  }
}

async function createTables(): Promise<void> {
  console.log('🏗️  Creating database tables...');
  
  // Create bot_agencies table
  const { error: agenciesError } = await supabase.rpc('create_bot_agencies_table');
  
  // Create bot_routes table  
  const { error: routesError } = await supabase.rpc('create_bot_routes_table');
  
  // Create bot_stops table
  const { error: stopsError } = await supabase.rpc('create_bot_stops_table');

  if (agenciesError || routesError || stopsError) {
    console.log('ℹ️  Tables may already exist, continuing with import...');
  }
}

async function main() {
  console.log('🚂 Starting Back-on-Track Night Train Data Import');
  console.log(`📁 Data source: ${DATA_PATH}`);
  console.log('');

  const stats: ImportStats[] = [];

  try {
    // Ensure tables exist
    await createTables();

    // Import agencies
    console.log('1️⃣  Loading agencies data...');
    const agenciesData = await loadJsonFile('agencies.json');
    const agenciesStats = await importAgencies(agenciesData);
    stats.push(agenciesStats);

    // Import routes
    console.log('\n2️⃣  Loading routes data...');
    const routesData = await loadJsonFile('routes.json');
    const routesStats = await importRoutes(routesData);
    stats.push(routesStats);

    // Import stops
    console.log('\n3️⃣  Loading stops data...');
    const stopsData = await loadJsonFile('stops.json');
    const stopsStats = await importStops(stopsData);
    stats.push(stopsStats);

    // Print summary
    console.log('\n📊 Import Summary:');
    console.log('================');
    
    stats.forEach(stat => {
      const status = stat.success ? '✅' : '❌';
      const duration = `${stat.duration}ms`;
      console.log(`${status} ${stat.file}: ${stat.records} records (${duration})`);
      if (!stat.success && stat.error) {
        console.log(`   Error: ${stat.error}`);
      }
    });

    const totalRecords = stats.reduce((sum, stat) => sum + stat.records, 0);
    const successfulImports = stats.filter(stat => stat.success).length;
    
    console.log('');
    console.log(`🎉 Import completed: ${totalRecords} total records`);
    console.log(`📈 Success rate: ${successfulImports}/${stats.length} files`);

  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main();
}