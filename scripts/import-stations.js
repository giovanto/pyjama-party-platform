const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/pajama-party.db';
const db = new sqlite3.Database(dbPath);

// Major European railway stations with coordinates
const stations = [
  // Germany
  { name: 'Berlin Hauptbahnhof', country: 'Germany', lat: 52.5251, lng: 13.3691 },
  { name: 'München Hauptbahnhof', country: 'Germany', lat: 48.1402, lng: 11.5581 },
  { name: 'Hamburg Hauptbahnhof', country: 'Germany', lat: 53.5528, lng: 10.0067 },
  { name: 'Frankfurt am Main Hauptbahnhof', country: 'Germany', lat: 49.4872, lng: 8.6634 },
  { name: 'Köln Hauptbahnhof', country: 'Germany', lat: 50.9430, lng: 6.9593 },
  { name: 'Dresden Hauptbahnhof', country: 'Germany', lat: 51.0404, lng: 13.7320 },
  { name: 'Leipzig Hauptbahnhof', country: 'Germany', lat: 51.3459, lng: 12.3821 },
  { name: 'Nürnberg Hauptbahnhof', country: 'Germany', lat: 49.4458, lng: 11.0826 },
  
  // France
  { name: 'Paris Gare du Nord', country: 'France', lat: 48.8809, lng: 2.3553 },
  { name: 'Paris Gare de Lyon', country: 'France', lat: 48.8441, lng: 2.3730 },
  { name: 'Lyon Part-Dieu', country: 'France', lat: 45.7607, lng: 4.8594 },
  { name: 'Marseille Saint-Charles', country: 'France', lat: 43.3026, lng: 5.3806 },
  { name: 'Toulouse Matabiau', country: 'France', lat: 43.6109, lng: 1.4541 },
  { name: 'Bordeaux Saint-Jean', country: 'France', lat: 44.8260, lng: -0.5568 },
  { name: 'Lille Europe', country: 'France', lat: 50.6387, lng: 3.0755 },
  { name: 'Strasbourg', country: 'France', lat: 48.5844, lng: 7.7345 },
  { name: 'Nice Ville', country: 'France', lat: 43.7050, lng: 7.2615 },
  
  // Italy
  { name: 'Roma Termini', country: 'Italy', lat: 41.9010, lng: 12.5015 },
  { name: 'Milano Centrale', country: 'Italy', lat: 45.4864, lng: 9.2058 },
  { name: 'Napoli Centrale', country: 'Italy', lat: 40.8527, lng: 14.2773 },
  { name: 'Firenze Santa Maria Novella', country: 'Italy', lat: 43.7766, lng: 11.2487 },
  { name: 'Venezia Santa Lucia', country: 'Italy', lat: 45.4419, lng: 12.3206 },
  { name: 'Torino Porta Nuova', country: 'Italy', lat: 45.0619, lng: 7.6787 },
  { name: 'Bologna Centrale', country: 'Italy', lat: 44.5058, lng: 11.3426 },
  { name: 'Verona Porta Nuova', country: 'Italy', lat: 45.4289, lng: 10.9824 },
  
  // Spain
  { name: 'Madrid Atocha', country: 'Spain', lat: 40.4064, lng: -3.6913 },
  { name: 'Barcelona Sants', country: 'Spain', lat: 41.3791, lng: 2.1397 },
  { name: 'Sevilla Santa Justa', country: 'Spain', lat: 37.3919, lng: -5.9756 },
  { name: 'Valencia Joaquín Sorolla', country: 'Spain', lat: 39.4663, lng: -0.3762 },
  { name: 'Málaga María Zambrano', country: 'Spain', lat: 36.7126, lng: -4.4320 },
  { name: 'Zaragoza Delicias', country: 'Spain', lat: 41.6439, lng: -0.9315 },
  
  // Netherlands
  { name: 'Amsterdam Centraal', country: 'Netherlands', lat: 52.3789, lng: 4.9004 },
  { name: 'Rotterdam Centraal', country: 'Netherlands', lat: 51.9244, lng: 4.4689 },
  { name: 'Den Haag Centraal', country: 'Netherlands', lat: 52.0808, lng: 4.3250 },
  { name: 'Utrecht Centraal', country: 'Netherlands', lat: 52.0888, lng: 5.1100 },
  { name: 'Eindhoven Centraal', country: 'Netherlands', lat: 51.4433, lng: 5.4819 },
  
  // Belgium
  { name: 'Bruxelles-Central', country: 'Belgium', lat: 50.8455, lng: 4.3573 },
  { name: 'Antwerpen-Centraal', country: 'Belgium', lat: 51.2172, lng: 4.4214 },
  { name: 'Gent-Sint-Pieters', country: 'Belgium', lat: 51.0361, lng: 3.7102 },
  { name: 'Liège-Guillemins', country: 'Belgium', lat: 50.6244, lng: 5.5667 },
  
  // Switzerland
  { name: 'Zürich Hauptbahnhof', country: 'Switzerland', lat: 47.3781, lng: 8.5400 },
  { name: 'Genève Cornavin', country: 'Switzerland', lat: 46.2104, lng: 6.1420 },
  { name: 'Bern Hauptbahnhof', country: 'Switzerland', lat: 46.9489, lng: 7.4398 },
  { name: 'Basel SBB', country: 'Switzerland', lat: 47.5475, lng: 7.5898 },
  { name: 'Lausanne', country: 'Switzerland', lat: 46.5167, lng: 6.6292 },
  
  // Austria
  { name: 'Wien Hauptbahnhof', country: 'Austria', lat: 48.1849, lng: 16.3783 },
  { name: 'Salzburg Hauptbahnhof', country: 'Austria', lat: 47.8129, lng: 13.0454 },
  { name: 'Innsbruck Hauptbahnhof', country: 'Austria', lat: 47.2632, lng: 11.4013 },
  { name: 'Graz Hauptbahnhof', country: 'Austria', lat: 47.0707, lng: 15.4157 },
  
  // Czech Republic
  { name: 'Praha hlavní nádraží', country: 'Czech Republic', lat: 50.0838, lng: 14.4357 },
  { name: 'Brno hlavní nádraží', country: 'Czech Republic', lat: 49.1905, lng: 16.6123 },
  
  // Poland
  { name: 'Warszawa Centralna', country: 'Poland', lat: 52.2289, lng: 21.0031 },
  { name: 'Kraków Główny', country: 'Poland', lat: 50.0679, lng: 19.9449 },
  { name: 'Gdańsk Główny', country: 'Poland', lat: 54.3559, lng: 18.6403 },
  { name: 'Wrocław Główny', country: 'Poland', lat: 51.0979, lng: 17.0371 },
  
  // Hungary
  { name: 'Budapest Keleti', country: 'Hungary', lat: 47.5002, lng: 19.0840 },
  { name: 'Budapest Nyugati', country: 'Hungary', lat: 47.5108, lng: 19.0577 },
  
  // Portugal
  { name: 'Lisboa Oriente', country: 'Portugal', lat: 38.7682, lng: -9.0982 },
  { name: 'Porto Campanhã', country: 'Portugal', lat: 41.1489, lng: -8.5854 },
  
  // Sweden
  { name: 'Stockholm Central', country: 'Sweden', lat: 59.3309, lng: 18.0581 },
  { name: 'Göteborg Central', country: 'Sweden', lat: 57.7089, lng: 11.9746 },
  { name: 'Malmö Central', country: 'Sweden', lat: 55.6090, lng: 13.0007 },
  
  // Denmark
  { name: 'København H', country: 'Denmark', lat: 55.6725, lng: 12.5646 },
  { name: 'Aarhus H', country: 'Denmark', lat: 56.1496, lng: 10.2043 },
  
  // Norway
  { name: 'Oslo S', country: 'Norway', lat: 59.9115, lng: 10.7522 },
  { name: 'Bergen stasjon', country: 'Norway', lat: 60.3913, lng: 5.3221 },
  
  // Finland
  { name: 'Helsinki päärautatieasema', country: 'Finland', lat: 60.1708, lng: 24.9414 },
  
  // UK
  { name: 'London St Pancras', country: 'United Kingdom', lat: 51.5308, lng: -0.1238 },
  { name: 'London Kings Cross', country: 'United Kingdom', lat: 51.5308, lng: -0.1238 },
  { name: 'Edinburgh Waverley', country: 'United Kingdom', lat: 55.9520, lng: -3.1883 },
  { name: 'Manchester Piccadilly', country: 'United Kingdom', lat: 53.4774, lng: -2.2309 },
  { name: 'Birmingham New Street', country: 'United Kingdom', lat: 52.4777, lng: -1.8996 }
];

console.log('🚂 Importing European railway stations...');

db.serialize(() => {
  // Clear existing stations
  db.run('DELETE FROM stations');
  
  // Prepare insert statement
  const stmt = db.prepare('INSERT INTO stations (id, name, country, lat, lng) VALUES (?, ?, ?, ?, ?)');
  
  stations.forEach((station, index) => {
    const id = `station_${index + 1}`;
    stmt.run(id, station.name, station.country, station.lat, station.lng);
  });
  
  stmt.finalize((err) => {
    if (err) {
      console.error('Error importing stations:', err);
    } else {
      console.log(`✅ Successfully imported ${stations.length} European railway stations`);
    }
    
    // Verify import
    db.get('SELECT COUNT(*) as count FROM stations', (err, row) => {
      if (err) {
        console.error('Error verifying import:', err);
      } else {
        console.log(`📊 Total stations in database: ${row.count}`);
      }
      
      db.close();
    });
  });
});