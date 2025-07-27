#!/usr/bin/env node

/**
 * TripHop Places Data Import Script
 * Transforms TripHop JSON data into multilingual JSONB format for the places table
 * 
 * Usage: node scripts/import-triphop-places.js [--dry-run] [--language=en]
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const TRIPHOP_DATA_PATH = path.join(__dirname, '../data/triphop-places.json');
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_LANGUAGE = process.argv.find(arg => arg.startsWith('--language='))?.split('=')[1] || 'en';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Transform TripHop place data to multilingual JSONB format
 */
function transformTripHopPlace(tripHopPlace) {
  const {
    place_id,
    place_name,
    place_lat,
    place_lon,
    place_brief_desc,
    place_longer_desc,
    place_image,
    place_country,
    lat_lon_tolerance,
    image_attribution
  } = tripHopPlace;

  // Create multilingual content structure
  // Start with English (from TripHop data)
  const content = {
    [TARGET_LANGUAGE]: {
      name: place_name,
      brief_desc: place_brief_desc || '',
      longer_desc: place_longer_desc || ''
    }
  };

  // Determine place type and tags based on content analysis
  const placeType = determinePlaceType(place_name, place_brief_desc);
  const tags = extractTags(place_brief_desc, place_longer_desc);
  const priorityScore = calculatePriorityScore(place_name, place_country, place_brief_desc);

  return {
    place_id,
    place_lat: parseFloat(place_lat),
    place_lon: parseFloat(place_lon),
    place_country,
    place_image: place_image || null,
    image_attribution: image_attribution || null,
    content,
    place_type: placeType,
    priority_score: priorityScore,
    tags,
    lat_lon_tolerance: lat_lon_tolerance || 3.0,
    source_type: 'triphop',
    source_data: {
      original_data: tripHopPlace,
      import_date: new Date().toISOString(),
      import_version: '1.0'
    }
  };
}

/**
 * Determine place type based on name and description
 */
function determinePlaceType(name, description) {
  const nameStr = (name || '').toLowerCase();
  const descStr = (description || '').toLowerCase();
  
  // Check for stations/transport hubs
  if (nameStr.includes('station') || nameStr.includes('airport') || nameStr.includes('port')) {
    return 'station';
  }
  
  // Check for natural/outdoor places
  if (descStr.includes('mountain') || descStr.includes('lake') || descStr.includes('park') || 
      descStr.includes('nature') || descStr.includes('hiking') || descStr.includes('skiing')) {
    return 'nature';
  }
  
  // Check for cultural/historic places
  if (descStr.includes('museum') || descStr.includes('cathedral') || descStr.includes('palace') || 
      descStr.includes('castle') || descStr.includes('historic') || descStr.includes('architecture')) {
    return 'cultural';
  }
  
  // Check for beach/coastal destinations
  if (descStr.includes('beach') || descStr.includes('coast') || descStr.includes('island') || 
      descStr.includes('sea') || descStr.includes('mediterranean')) {
    return 'coastal';
  }
  
  // Default to destination for cities and general places
  return 'destination';
}

/**
 * Extract relevant tags from place descriptions
 */
function extractTags(briefDesc, longerDesc) {
  const text = ((briefDesc || '') + ' ' + (longerDesc || '')).toLowerCase();
  const tags = [];
  
  // Cultural tags
  if (text.match(/\b(museum|art|culture|historic|heritage|cathedral|palace|castle|baroque|renaissance|gothic)\b/)) {
    tags.push('cultural');
  }
  
  // Nature tags
  if (text.match(/\b(nature|mountain|lake|park|hiking|skiing|alpine|forest|river)\b/)) {
    tags.push('nature');
  }
  
  // Urban tags
  if (text.match(/\b(city|urban|shopping|nightlife|restaurant|cafe|modern|downtown)\b/)) {
    tags.push('urban');
  }
  
  // Food & drink tags
  if (text.match(/\b(food|cuisine|wine|beer|chocolate|restaurant|culinary|gastronomy)\b/)) {
    tags.push('food');
  }
  
  // Adventure/activity tags
  if (text.match(/\b(adventure|activity|sport|cycling|skiing|climbing|water|outdoor)\b/)) {
    tags.push('adventure');
  }
  
  // Beach/coastal tags
  if (text.match(/\b(beach|coast|sea|island|mediterranean|swimming|sailing)\b/)) {
    tags.push('coastal');
  }
  
  // Remove duplicates and return
  return [...new Set(tags)];
}

/**
 * Calculate priority score based on various factors
 */
function calculatePriorityScore(name, country, description) {
  let score = 1; // Base score
  
  // Higher priority for capital cities and major destinations
  const majorDestinations = [
    'vienna', 'paris', 'berlin', 'rome', 'madrid', 'amsterdam', 'barcelona', 
    'prague', 'budapest', 'stockholm', 'copenhagen', 'oslo', 'zurich', 'geneva'
  ];
  
  const nameStr = (name || '').toLowerCase();
  if (majorDestinations.some(dest => nameStr.includes(dest))) {
    score += 5;
  }
  
  // Higher priority for well-described places (more content = more interesting)
  const descLength = (description || '').length;
  if (descLength > 500) score += 3;
  else if (descLength > 200) score += 2;
  else if (descLength > 100) score += 1;
  
  // Country-based adjustments (major tourism countries)
  const majorTourismCountries = ['France', 'Germany', 'Italy', 'Spain', 'Austria', 'Switzerland'];
  if (majorTourismCountries.includes(country)) {
    score += 2;
  }
  
  return Math.min(score, 10); // Cap at 10
}

/**
 * Import places data into Supabase
 */
async function importPlaces(places) {
  console.log(`📦 Importing ${places.length} places...`);
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No data will be inserted');
    console.log('Sample transformed place:', JSON.stringify(places[0], null, 2));
    return;
  }
  
  // Batch insert for better performance
  const BATCH_SIZE = 50;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    const batch = places.slice(i, i + BATCH_SIZE);
    
    try {
      const { data, error } = await supabase
        .from('places')
        .upsert(batch, { 
          onConflict: 'place_id',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Error in batch ${i / BATCH_SIZE + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`✅ Imported batch ${i / BATCH_SIZE + 1} (${batch.length} places)`);
      }
    } catch (err) {
      console.error(`❌ Exception in batch ${i / BATCH_SIZE + 1}:`, err);
      errorCount += batch.length;
    }
  }
  
  console.log(`\n📊 Import Summary:`);
  console.log(`✅ Successful: ${successCount} places`);
  console.log(`❌ Failed: ${errorCount} places`);
  console.log(`📈 Success rate: ${((successCount / places.length) * 100).toFixed(1)}%`);
}

/**
 * Validate imported data
 */
async function validateImport() {
  console.log('\n🔍 Validating imported data...');
  
  try {
    // Check total count
    const { count, error: countError } = await supabase
      .from('places')
      .select('*', { count: 'exact', head: true })
      .eq('source_type', 'triphop');
    
    if (countError) {
      console.error('❌ Error checking count:', countError);
      return;
    }
    
    console.log(`📊 Total TripHop places in database: ${count}`);
    
    // Check sample data
    const { data: sampleData, error: sampleError } = await supabase
      .from('places')
      .select('place_id, content, place_country, tags, priority_score')
      .eq('source_type', 'triphop')
      .limit(3);
    
    if (sampleError) {
      console.error('❌ Error fetching samples:', sampleError);
      return;
    }
    
    console.log('\n📋 Sample imported places:');
    sampleData.forEach((place, index) => {
      console.log(`\n${index + 1}. ${place.place_id} (${place.place_country})`);
      console.log(`   Name: ${place.content?.en?.name || 'N/A'}`);
      console.log(`   Tags: [${place.tags?.join(', ') || 'none'}]`);
      console.log(`   Priority: ${place.priority_score}`);
    });
    
    // Check multilingual content structure
    const { data: contentCheck, error: contentError } = await supabase
      .from('places')
      .select('content')
      .eq('source_type', 'triphop')
      .not('content', 'is', null)
      .limit(1);
    
    if (contentError) {
      console.error('❌ Error checking content structure:', contentError);
      return;
    }
    
    if (contentCheck.length > 0) {
      console.log('\n✅ Content structure validation passed');
      console.log('Sample content structure:', JSON.stringify(contentCheck[0].content, null, 2));
    }
    
  } catch (err) {
    console.error('❌ Validation error:', err);
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚂 TripHop Places Import Script');
  console.log('================================\n');
  
  // Load TripHop data
  console.log('📁 Loading TripHop places data...');
  
  if (!fs.existsSync(TRIPHOP_DATA_PATH)) {
    console.error(`❌ TripHop data file not found: ${TRIPHOP_DATA_PATH}`);
    process.exit(1);
  }
  
  const rawData = fs.readFileSync(TRIPHOP_DATA_PATH, 'utf8');
  const tripHopData = JSON.parse(rawData);
  
  // Convert object to array if needed
  const placesArray = Array.isArray(tripHopData) 
    ? tripHopData 
    : Object.values(tripHopData);
  
  console.log(`📊 Found ${placesArray.length} places in TripHop data`);
  
  // Transform data
  console.log('🔄 Transforming data to multilingual format...');
  const transformedPlaces = placesArray.map(transformTripHopPlace);
  
  // Show statistics
  const countries = [...new Set(transformedPlaces.map(p => p.place_country))];
  const placeTypes = transformedPlaces.reduce((acc, p) => {
    acc[p.place_type] = (acc[p.place_type] || 0) + 1;
    return acc;
  }, {});
  
  console.log(`\n📈 Import Statistics:`);
  console.log(`🌍 Countries: ${countries.length} (${countries.slice(0, 5).join(', ')}${countries.length > 5 ? '...' : ''})`);
  console.log(`🏷️  Place types:`, placeTypes);
  console.log(`🎯 Target language: ${TARGET_LANGUAGE}`);
  
  // Import data
  await importPlaces(transformedPlaces);
  
  // Validate if not dry run
  if (!DRY_RUN) {
    await validateImport();
  }
  
  console.log('\n🎉 Import process completed!');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  transformTripHopPlace,
  determinePlaceType,
  extractTags,
  calculatePriorityScore
};