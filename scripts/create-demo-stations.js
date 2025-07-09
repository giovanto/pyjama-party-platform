#!/usr/bin/env node

/**
 * Create demo station data for immediate development use
 * This creates a curated list of major European railway stations
 */

const fs = require('fs');
const path = require('path');

// Curated list of major European railway stations with coordinates
const DEMO_STATIONS = [
    // Germany
    { name: 'Berlin Hauptbahnhof', country: 'DE', lat: 52.5251, lon: 13.3691, city: 'Berlin', type: 'station' },
    { name: 'Hamburg Hauptbahnhof', country: 'DE', lat: 53.5533, lon: 10.0067, city: 'Hamburg', type: 'station' },
    { name: 'München Hauptbahnhof', country: 'DE', lat: 48.1401, lon: 11.5583, city: 'Munich', type: 'station' },
    { name: 'Frankfurt (Main) Hauptbahnhof', country: 'DE', lat: 50.1070, lon: 8.6634, city: 'Frankfurt', type: 'station' },
    { name: 'Köln Hauptbahnhof', country: 'DE', lat: 50.9430, lon: 6.9589, city: 'Cologne', type: 'station' },
    
    // France
    { name: 'Paris Gare du Nord', country: 'FR', lat: 48.8809, lon: 2.3553, city: 'Paris', type: 'station' },
    { name: 'Paris Gare de Lyon', country: 'FR', lat: 48.8447, lon: 2.3738, city: 'Paris', type: 'station' },
    { name: 'Lyon Part-Dieu', country: 'FR', lat: 45.7603, lon: 4.8594, city: 'Lyon', type: 'station' },
    { name: 'Marseille-Saint-Charles', country: 'FR', lat: 43.3032, lon: 5.3806, city: 'Marseille', type: 'station' },
    { name: 'Strasbourg-Ville', country: 'FR', lat: 48.5847, lon: 7.7349, city: 'Strasbourg', type: 'station' },
    
    // Italy
    { name: 'Roma Termini', country: 'IT', lat: 41.9010, lon: 12.5017, city: 'Rome', type: 'station' },
    { name: 'Milano Centrale', country: 'IT', lat: 45.4862, lon: 9.2051, city: 'Milan', type: 'station' },
    { name: 'Napoli Centrale', country: 'IT', lat: 40.8523, lon: 14.2754, city: 'Naples', type: 'station' },
    { name: 'Venezia Santa Lucia', country: 'IT', lat: 45.4414, lon: 12.3194, city: 'Venice', type: 'station' },
    { name: 'Firenze Santa Maria Novella', country: 'IT', lat: 43.7765, lon: 11.2484, city: 'Florence', type: 'station' },
    
    // Spain
    { name: 'Madrid Atocha', country: 'ES', lat: 40.4066, lon: -3.6892, city: 'Madrid', type: 'station' },
    { name: 'Barcelona Sants', country: 'ES', lat: 41.3794, lon: 2.1404, city: 'Barcelona', type: 'station' },
    { name: 'Sevilla-Santa Justa', country: 'ES', lat: 37.3919, lon: -5.9753, city: 'Seville', type: 'station' },
    { name: 'Valencia Joaquín Sorolla', country: 'ES', lat: 39.4662, lon: -0.3774, city: 'Valencia', type: 'station' },
    
    // Netherlands
    { name: 'Amsterdam Centraal', country: 'NL', lat: 52.3789, lon: 4.9004, city: 'Amsterdam', type: 'station' },
    { name: 'Rotterdam Centraal', country: 'NL', lat: 51.9244, lon: 4.4689, city: 'Rotterdam', type: 'station' },
    { name: 'Den Haag Centraal', country: 'NL', lat: 52.0809, lon: 4.3243, city: 'The Hague', type: 'station' },
    { name: 'Utrecht Centraal', country: 'NL', lat: 52.0889, lon: 5.1101, city: 'Utrecht', type: 'station' },
    
    // Belgium
    { name: 'Bruxelles-Central', country: 'BE', lat: 50.8454, lon: 4.3570, city: 'Brussels', type: 'station' },
    { name: 'Antwerpen-Centraal', country: 'BE', lat: 51.2172, lon: 4.4214, city: 'Antwerp', type: 'station' },
    { name: 'Gent-Sint-Pieters', country: 'BE', lat: 51.0358, lon: 3.7108, city: 'Ghent', type: 'station' },
    
    // Austria
    { name: 'Wien Hauptbahnhof', country: 'AT', lat: 48.1851, lon: 16.3721, city: 'Vienna', type: 'station' },
    { name: 'Salzburg Hauptbahnhof', country: 'AT', lat: 47.8132, lon: 13.0459, city: 'Salzburg', type: 'station' },
    { name: 'Innsbruck Hauptbahnhof', country: 'AT', lat: 47.2632, lon: 11.4008, city: 'Innsbruck', type: 'station' },
    
    // Switzerland
    { name: 'Zürich Hauptbahnhof', country: 'CH', lat: 47.3781, lon: 8.5402, city: 'Zurich', type: 'station' },
    { name: 'Basel SBB', country: 'CH', lat: 47.5474, lon: 7.5900, city: 'Basel', type: 'station' },
    { name: 'Genève-Cornavin', country: 'CH', lat: 46.2104, lon: 6.1423, city: 'Geneva', type: 'station' },
    { name: 'Bern', country: 'CH', lat: 46.9489, lon: 7.4394, city: 'Bern', type: 'station' },
    
    // Czech Republic
    { name: 'Praha hlavní nádraží', country: 'CZ', lat: 50.0833, lon: 14.4358, city: 'Prague', type: 'station' },
    { name: 'Brno hlavní nádraží', country: 'CZ', lat: 49.1910, lon: 16.6127, city: 'Brno', type: 'station' },
    
    // Poland
    { name: 'Warszawa Centralna', country: 'PL', lat: 52.2297, lon: 21.0122, city: 'Warsaw', type: 'station' },
    { name: 'Kraków Główny', country: 'PL', lat: 50.0677, lon: 19.9474, city: 'Krakow', type: 'station' },
    { name: 'Gdańsk Główny', country: 'PL', lat: 54.3560, lon: 18.6445, city: 'Gdansk', type: 'station' },
    
    // Hungary
    { name: 'Budapest-Keleti', country: 'HU', lat: 47.5000, lon: 19.0833, city: 'Budapest', type: 'station' },
    { name: 'Budapest-Nyugati', country: 'HU', lat: 47.5106, lon: 19.0573, city: 'Budapest', type: 'station' },
    
    // Denmark
    { name: 'København Hovedbanegård', country: 'DK', lat: 55.6723, lon: 12.5649, city: 'Copenhagen', type: 'station' },
    { name: 'Aarhus Hovedbanegård', country: 'DK', lat: 56.1496, lon: 10.2045, city: 'Aarhus', type: 'station' },
    
    // Sweden
    { name: 'Stockholm Centralstation', country: 'SE', lat: 59.3307, lon: 18.0572, city: 'Stockholm', type: 'station' },
    { name: 'Göteborg Centralstation', country: 'SE', lat: 57.7089, lon: 11.9727, city: 'Gothenburg', type: 'station' },
    { name: 'Malmö Centralstation', country: 'SE', lat: 55.6093, lon: 13.0007, city: 'Malmö', type: 'station' },
    
    // Norway
    { name: 'Oslo Sentralstasjon', country: 'NO', lat: 59.9111, lon: 10.7528, city: 'Oslo', type: 'station' },
    { name: 'Bergen stasjon', country: 'NO', lat: 60.3906, lon: 5.3319, city: 'Bergen', type: 'station' },
    
    // Finland
    { name: 'Helsinki Päärautatieasema', country: 'FI', lat: 60.1719, lon: 24.9414, city: 'Helsinki', type: 'station' },
    { name: 'Tampere rautatieasema', country: 'FI', lat: 61.4991, lon: 23.7739, city: 'Tampere', type: 'station' },
    
    // Portugal
    { name: 'Lisboa Oriente', country: 'PT', lat: 38.7681, lon: -9.0983, city: 'Lisbon', type: 'station' },
    { name: 'Porto Campanhã', country: 'PT', lat: 41.1496, lon: -8.5834, city: 'Porto', type: 'station' },
    
    // Greece
    { name: 'Αθήνα (Athens)', country: 'GR', lat: 37.9906, lon: 23.7304, city: 'Athens', type: 'station' },
    { name: 'Θεσσαλονίκη (Thessaloniki)', country: 'GR', lat: 40.6334, lon: 22.9447, city: 'Thessaloniki', type: 'station' },
    
    // United Kingdom
    { name: 'London King\'s Cross', country: 'GB', lat: 51.5308, lon: -0.1238, city: 'London', type: 'station' },
    { name: 'London St Pancras International', country: 'GB', lat: 51.5319, lon: -0.1264, city: 'London', type: 'station' },
    { name: 'Manchester Piccadilly', country: 'GB', lat: 53.4773, lon: -2.2309, city: 'Manchester', type: 'station' },
    { name: 'Edinburgh Waverley', country: 'GB', lat: 55.9521, lon: -3.1907, city: 'Edinburgh', type: 'station' },
    
    // Ireland
    { name: 'Dublin Connolly', country: 'IE', lat: 53.3515, lon: -6.2497, city: 'Dublin', type: 'station' },
    { name: 'Cork Kent Station', country: 'IE', lat: 51.9014, lon: -8.4597, city: 'Cork', type: 'station' },
];

// Country names mapping
const COUNTRY_NAMES = {
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'NL': 'Netherlands',
    'BE': 'Belgium',
    'AT': 'Austria',
    'CH': 'Switzerland',
    'CZ': 'Czech Republic',
    'PL': 'Poland',
    'HU': 'Hungary',
    'DK': 'Denmark',
    'SE': 'Sweden',
    'NO': 'Norway',
    'FI': 'Finland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'GB': 'United Kingdom',
    'IE': 'Ireland'
};

function createDemoStationData() {
    const outputDir = path.join(__dirname, '..', 'data');
    const outputFile = path.join(outputDir, 'european_stations.json');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Process stations and add additional metadata
    const processedStations = DEMO_STATIONS.map((station, index) => ({
        id: `demo_${index + 1}`,
        name: station.name,
        country: station.country,
        country_name: COUNTRY_NAMES[station.country] || station.country,
        city: station.city,
        lat: station.lat,
        lon: station.lon,
        type: station.type,
        coordinates: [station.lon, station.lat], // GeoJSON format [lon, lat]
        searchable: `${station.name} ${station.city} ${COUNTRY_NAMES[station.country]}`.toLowerCase()
    }));
    
    // Group by country for easy access
    const stationsByCountry = {};
    processedStations.forEach(station => {
        if (!stationsByCountry[station.country]) {
            stationsByCountry[station.country] = [];
        }
        stationsByCountry[station.country].push(station);
    });
    
    // Create output data structure
    const outputData = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalStations: processedStations.length,
            countries: Object.keys(stationsByCountry).length,
            dataSource: 'Curated demo data',
            description: 'Major European railway stations for development and demo purposes'
        },
        stations: processedStations,
        by_country: stationsByCountry,
        countries: Object.keys(stationsByCountry).sort().map(code => ({
            code: code,
            name: COUNTRY_NAMES[code] || code,
            stationCount: stationsByCountry[code].length
        }))
    };
    
    // Write to file
    fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
    
    console.log('✅ Demo station data created successfully!');
    console.log(`📍 Total stations: ${processedStations.length}`);
    console.log(`🌍 Countries: ${Object.keys(stationsByCountry).length}`);
    console.log(`📁 Output file: ${outputFile}`);
    
    // Show country breakdown
    console.log('\n🗺️  Country breakdown:');
    Object.entries(stationsByCountry)
        .sort(([,a], [,b]) => b.length - a.length)
        .forEach(([country, stations]) => {
            console.log(`   ${country} (${COUNTRY_NAMES[country]}): ${stations.length} stations`);
        });
    
    return outputFile;
}

// Run if called directly
if (require.main === module) {
    createDemoStationData();
}

module.exports = { createDemoStationData, DEMO_STATIONS, COUNTRY_NAMES };