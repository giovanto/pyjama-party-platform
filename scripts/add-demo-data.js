const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/pajama-party.db';
const db = new sqlite3.Database(dbPath);

// Demo dreams data
const demoDreams = [
  {
    origin_station: 'Berlin Hauptbahnhof',
    origin_country: 'Germany',
    origin_lat: 52.5251,
    origin_lng: 13.3691,
    destination_city: 'Barcelona',
    destination_country: 'Spain',
    destination_lat: 41.3851,
    destination_lng: 2.1734,
    email: null
  },
  {
    origin_station: 'Amsterdam Centraal',
    origin_country: 'Netherlands',
    origin_lat: 52.3789,
    origin_lng: 4.9004,
    destination_city: 'Prague',
    destination_country: 'Czech Republic',
    destination_lat: 50.0755,
    destination_lng: 14.4378,
    email: null
  },
  {
    origin_station: 'Paris Gare du Nord',
    origin_country: 'France',
    origin_lat: 48.8809,
    origin_lng: 2.3553,
    destination_city: 'Vienna',
    destination_country: 'Austria',
    destination_lat: 48.2082,
    destination_lng: 16.3738,
    email: null
  },
  {
    origin_station: 'Milano Centrale',
    origin_country: 'Italy',
    origin_lat: 45.4864,
    origin_lng: 9.2058,
    destination_city: 'Stockholm',
    destination_country: 'Sweden',
    destination_lat: 59.3293,
    destination_lng: 18.0686,
    email: 'demo@example.com'
  },
  {
    origin_station: 'München Hauptbahnhof',
    origin_country: 'Germany',
    origin_lat: 48.1402,
    origin_lng: 11.5581,
    destination_city: 'Venice',
    destination_country: 'Italy',
    destination_lat: 45.4408,
    destination_lng: 12.3155,
    email: null
  },
  {
    origin_station: 'London St Pancras',
    origin_country: 'United Kingdom',
    origin_lat: 51.5308,
    origin_lng: -0.1238,
    destination_city: 'Budapest',
    destination_country: 'Hungary',
    destination_lat: 47.4979,
    destination_lng: 19.0402,
    email: null
  },
  {
    origin_station: 'Zürich Hauptbahnhof',
    origin_country: 'Switzerland',
    origin_lat: 47.3781,
    origin_lng: 8.5400,
    destination_city: 'Copenhagen',
    destination_country: 'Denmark',
    destination_lat: 55.6761,
    destination_lng: 12.5683,
    email: 'traveler@example.com'
  },
  {
    origin_station: 'Berlin Hauptbahnhof',
    origin_country: 'Germany',
    origin_lat: 52.5251,
    origin_lng: 13.3691,
    destination_city: 'Oslo',
    destination_country: 'Norway',
    destination_lat: 59.9139,
    destination_lng: 10.7522,
    email: null
  },
  {
    origin_station: 'Amsterdam Centraal',
    origin_country: 'Netherlands',
    origin_lat: 52.3789,
    origin_lng: 4.9004,
    destination_city: 'Rome',
    destination_country: 'Italy',
    destination_lat: 41.9028,
    destination_lng: 12.4964,
    email: null
  },
  {
    origin_station: 'Madrid Atocha',
    origin_country: 'Spain',
    origin_lat: 40.4064,
    origin_lng: -3.6913,
    destination_city: 'Berlin',
    destination_country: 'Germany',
    destination_lat: 52.5200,
    destination_lng: 13.4050,
    email: null
  }
];

console.log('🎭 Adding demo dreams to database...');

db.serialize(() => {
  // Clear existing dreams
  db.run('DELETE FROM dreams');
  
  // Prepare insert statement
  const stmt = db.prepare(`INSERT INTO dreams (
    id, origin_station, origin_country, origin_lat, origin_lng,
    destination_city, destination_country, destination_lat, destination_lng,
    email, expires_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  let count = 0;
  
  demoDreams.forEach(dream => {
    const dreamId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days retention
    
    stmt.run(
      dreamId,
      dream.origin_station,
      dream.origin_country,
      dream.origin_lat,
      dream.origin_lng,
      dream.destination_city,
      dream.destination_country,
      dream.destination_lat,
      dream.destination_lng,
      dream.email,
      expiresAt.toISOString()
    );
    
    count++;
  });
  
  stmt.finalize((err) => {
    if (err) {
      console.error('Error adding demo dreams:', err);
    } else {
      console.log(`✅ Successfully added ${count} demo dreams`);
    }
    
    // Update stats
    db.run(`UPDATE stats SET value = ${count}, updated_at = CURRENT_TIMESTAMP WHERE key = "total_dreams"`);
    
    // Calculate unique stations
    const uniqueStations = [...new Set(demoDreams.map(d => d.origin_station))];
    db.run(`UPDATE stats SET value = ${uniqueStations.length}, updated_at = CURRENT_TIMESTAMP WHERE key = "active_stations"`);
    
    console.log(`📊 Updated stats: ${count} dreams, ${uniqueStations.length} stations`);
    
    // Verify data
    db.get('SELECT COUNT(*) as count FROM dreams', (err, row) => {
      if (err) {
        console.error('Error verifying dreams:', err);
      } else {
        console.log(`🔍 Total dreams in database: ${row.count}`);
      }
      
      db.close();
    });
  });
});