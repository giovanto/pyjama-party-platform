#!/usr/bin/env node

// Script to fetch TripHop places data and prepare for database integration

const fs = require('fs');
const path = require('path');

async function fetchPlacesData() {
  try {
    console.log('Fetching TripHop places data...');
    
    const response = await fetch('https://triphop.info/static/places.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const placesObject = await response.json();
    
    // Convert object to array of places
    const placesData = Object.values(placesObject);
    console.log(`✅ Fetched ${placesData.length} places`);
    
    // Save raw data
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(dataDir, 'triphop-places.json'), 
      JSON.stringify(placesObject, null, 2)
    );
    
    // Analyze data structure
    const samplePlace = placesData[0];
    console.log('\n📊 Sample place structure:');
    console.log(JSON.stringify(samplePlace, null, 2));
    
    // Generate SQL for places table
    console.log('\n🗃️ Generating SQL for places table...');
    generatePlacesSQL(placesData);
    
    console.log('\n✅ Places data fetched and prepared successfully!');
    
  } catch (error) {
    console.error('❌ Error fetching places data:', error);
    process.exit(1);
  }
}

function generatePlacesSQL(placesData) {
  const sqlPath = path.join(__dirname, '..', 'data', 'places-setup.sql');
  
  let sql = `-- European Places Database Setup
-- Generated from TripHop places data

-- Create places table with rich data
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_id VARCHAR(100) UNIQUE NOT NULL,
  place_name VARCHAR(255) NOT NULL,
  place_lat DECIMAL(10, 8) NOT NULL,
  place_lon DECIMAL(11, 8) NOT NULL,
  place_brief_desc TEXT,
  place_longer_desc TEXT,
  place_image VARCHAR(500),
  place_country VARCHAR(100) NOT NULL,
  lat_lon_tolerance DECIMAL(6, 4),
  image_attribution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for places search
CREATE INDEX IF NOT EXISTS idx_places_search ON places USING GIN (
  to_tsvector('english', place_name || ' ' || place_country || ' ' || place_brief_desc)
);

CREATE INDEX IF NOT EXISTS idx_places_country ON places (place_country);
CREATE INDEX IF NOT EXISTS idx_places_coordinates ON places (place_lat, place_lon);

-- Insert places data
INSERT INTO places (
  place_id, place_name, place_lat, place_lon, place_brief_desc, 
  place_longer_desc, place_image, place_country, lat_lon_tolerance, image_attribution
) VALUES
`;

  // Generate INSERT statements
  const values = placesData.map(place => {
    const escapeSql = (str) => str ? str.replace(/'/g, "''") : null;
    
    return `  ('${place.place_id}', '${escapeSql(place.place_name)}', ${place.place_lat}, ${place.place_lon}, ${
      place.place_brief_desc ? `'${escapeSql(place.place_brief_desc)}'` : 'NULL'
    }, ${
      place.place_longer_desc ? `'${escapeSql(place.place_longer_desc)}'` : 'NULL'
    }, ${
      place.place_image ? `'${escapeSql(place.place_image)}'` : 'NULL'
    }, '${escapeSql(place.place_country)}', ${place.lat_lon_tolerance || 'NULL'}, ${
      place.image_attribution ? `'${escapeSql(place.image_attribution)}'` : 'NULL'
    })`;
  });

  sql += values.join(',\n') + '\nON CONFLICT (place_id) DO NOTHING;\n\n';
  
  sql += `-- Enable RLS for places
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access on places" ON places
  FOR SELECT USING (true);
`;

  fs.writeFileSync(sqlPath, sql);
  console.log(`💾 SQL saved to: ${sqlPath}`);
}

// Run the script
fetchPlacesData();