const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/pajama-party.db');

console.log('🧹 Cleaning up database...');

db.serialize(() => {
  // Delete entries without proper names or with test data
  db.run(`DELETE FROM dreams WHERE 
    dreamer_name IS NULL OR 
    dreamer_name = "" OR 
    dreamer_name LIKE "test%" OR 
    dreamer_name LIKE "Test%" OR
    dreamer_name LIKE "%test%" OR
    origin_station IS NULL OR
    destination_city IS NULL`, (err) => {
    if (err) console.error('❌ Error cleaning names:', err);
    else console.log('✅ Cleaned up invalid names and empty records');
  });
  
  // Keep only the last 50 entries
  db.run(`DELETE FROM dreams WHERE id NOT IN (
    SELECT id FROM dreams ORDER BY created_at DESC LIMIT 50
  )`, (err) => {
    if (err) console.error('❌ Error limiting records:', err);
    else console.log('✅ Limited to 50 most recent records');
  });
  
  // Update stats
  db.run(`UPDATE stats SET value = (
    SELECT COUNT(*) FROM dreams
  ) WHERE key = "total_dreams"`, (err) => {
    if (err) console.error('❌ Error updating dream count:', err);
    else console.log('✅ Updated dream count');
  });
  
  db.run(`UPDATE stats SET value = (
    SELECT COUNT(DISTINCT origin_station) FROM dreams
  ) WHERE key = "active_stations"`, (err) => {
    if (err) console.error('❌ Error updating stations:', err);
    else console.log('✅ Updated station count');
  });
  
  // Show final counts
  db.get('SELECT COUNT(*) as count FROM dreams', (err, row) => {
    if (!err) {
      console.log('📊 Final dream count:', row.count);
    }
    
    db.all('SELECT dreamer_name, origin_station, destination_city FROM dreams ORDER BY created_at DESC LIMIT 10', (err, rows) => {
      if (!err) {
        console.log('📋 Sample recent dreams:');
        rows.forEach(row => {
          console.log(`  - ${row.dreamer_name}: ${row.origin_station} → ${row.destination_city}`);
        });
      }
      db.close();
      console.log('🎉 Database cleanup complete!');
    });
  });
});