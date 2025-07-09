#!/usr/bin/env node

/**
 * Fetch European railway stations from OpenRailwayMap API
 * This script queries the OpenRailwayMap API for major European cities
 * and builds a comprehensive station database
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { promisify } = require('util');

const API_BASE_URL = 'https://api.openrailwaymap.org/v2';
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'european_stations.json');

// Major European cities to query for railway stations
const EUROPEAN_CITIES = [
    // Western Europe
    'Amsterdam', 'Berlin', 'Brussels', 'Copenhagen', 'Dublin', 'Hamburg', 'London', 'Madrid', 'Paris', 'Rome', 'Stockholm', 'Vienna', 'Zurich',
    // Central Europe
    'Prague', 'Budapest', 'Warsaw', 'Krakow', 'Bratislava', 'Ljubljana', 'Zagreb', 'Belgrade', 'Bucharest', 'Sofia',
    // Northern Europe
    'Oslo', 'Helsinki', 'Tallinn', 'Riga', 'Vilnius', 'Gothenburg', 'Malmö', 'Aarhus',
    // Southern Europe
    'Barcelona', 'Valencia', 'Seville', 'Milan', 'Naples', 'Florence', 'Venice', 'Athens', 'Thessaloniki', 'Lisbon', 'Porto',
    // Eastern Europe
    'Kiev', 'Lviv', 'Minsk', 'Moscow', 'St. Petersburg', 'Kyiv', 'Odessa',
    // Additional major railway hubs
    'Frankfurt', 'Munich', 'Cologne', 'Stuttgart', 'Düsseldorf', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Strasbourg',
    'Bologna', 'Turin', 'Genoa', 'Palermo', 'Catania', 'Bari', 'Antwerp', 'Ghent', 'Rotterdam', 'The Hague', 'Utrecht'
];

// Countries to focus on (EU + associated countries)
const TARGET_COUNTRIES = [
    'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'CZ', 'PL', 'HU', 'SK', 'SI', 'HR', 'RO', 'BG', 
    'GR', 'PT', 'DK', 'SE', 'NO', 'FI', 'EE', 'LV', 'LT', 'IE', 'GB', 'LU', 'MT', 'CY'
];

class OpenRailwayMapClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.requestDelay = 100; // Rate limiting: 100ms between requests
        this.maxRetries = 3;
    }

    async makeRequest(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        return new Promise((resolve, reject) => {
            const request = https.get(url.toString(), (response) => {
                let data = '';
                response.on('data', (chunk) => data += chunk);
                response.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve(parsed);
                    } catch (error) {
                        reject(new Error(`JSON parse error: ${error.message}`));
                    }
                });
            });

            request.on('error', reject);
            request.setTimeout(5000, () => {
                request.abort();
                reject(new Error('Request timeout'));
            });
        });
    }

    async searchStations(query, limit = 50) {
        try {
            const response = await this.makeRequest('/facility', {
                q: query,
                limit: limit
            });
            return response || [];
        } catch (error) {
            console.error(`Error searching for "${query}":`, error.message);
            return [];
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class StationDataProcessor {
    constructor() {
        this.stationMap = new Map();
        this.duplicateCount = 0;
        this.errorCount = 0;
    }

    processStation(station) {
        // Validate required fields
        if (!station.lat || !station.lon || !station.name) {
            this.errorCount++;
            return null;
        }

        // Extract country from tags or coordinates
        let country = station.tags?.['addr:country'] || 
                     station.tags?.country || 
                     this.guessCountryFromCoords(station.lat, station.lon);

        // Skip if not in target countries
        if (country && !TARGET_COUNTRIES.includes(country.toUpperCase())) {
            return null;
        }

        // Create unique key to avoid duplicates
        const key = `${station.name.toLowerCase()}-${country}`;
        if (this.stationMap.has(key)) {
            this.duplicateCount++;
            return null;
        }

        // Process and clean station data
        const processedStation = {
            id: station.id,
            name: station.name.trim(),
            country: country?.toUpperCase() || 'UNKNOWN',
            lat: parseFloat(station.lat),
            lon: parseFloat(station.lon),
            type: station.tags?.railway || 'station',
            operator: station.tags?.operator || null,
            platforms: station.tags?.platforms || null,
            wheelchair: station.tags?.wheelchair || null,
            uic_ref: station.tags?.uic_ref || null,
            railway_ref: station.tags?.['railway:ref'] || null,
            rank: station.rank || 0,
            tags: this.extractRelevantTags(station.tags || {})
        };

        this.stationMap.set(key, processedStation);
        return processedStation;
    }

    extractRelevantTags(tags) {
        const relevantTags = {};
        const importantKeys = [
            'name:en', 'name:de', 'name:fr', 'name:it', 'name:es',
            'website', 'phone', 'email', 'addr:city', 'addr:postcode',
            'public_transport', 'train', 'railway', 'electrification'
        ];

        importantKeys.forEach(key => {
            if (tags[key]) {
                relevantTags[key] = tags[key];
            }
        });

        return relevantTags;
    }

    guessCountryFromCoords(lat, lon) {
        // Simple coordinate-based country guessing for major European countries
        const coords = { lat: parseFloat(lat), lon: parseFloat(lon) };
        
        // Germany
        if (coords.lat >= 47.3 && coords.lat <= 55.1 && coords.lon >= 5.9 && coords.lon <= 15.0) {
            return 'DE';
        }
        // France
        if (coords.lat >= 41.3 && coords.lat <= 51.1 && coords.lon >= -5.1 && coords.lon <= 9.6) {
            return 'FR';
        }
        // Italy
        if (coords.lat >= 36.6 && coords.lat <= 47.1 && coords.lon >= 6.6 && coords.lon <= 18.5) {
            return 'IT';
        }
        // Spain
        if (coords.lat >= 36.0 && coords.lat <= 43.8 && coords.lon >= -9.3 && coords.lon <= 3.3) {
            return 'ES';
        }
        // United Kingdom
        if (coords.lat >= 49.9 && coords.lat <= 60.9 && coords.lon >= -8.2 && coords.lon <= 1.8) {
            return 'GB';
        }
        // Netherlands
        if (coords.lat >= 50.7 && coords.lat <= 53.6 && coords.lon >= 3.4 && coords.lon <= 7.2) {
            return 'NL';
        }
        // Add more countries as needed...
        
        return 'UNKNOWN';
    }

    getUniqueStations() {
        return Array.from(this.stationMap.values());
    }

    getStats() {
        return {
            totalStations: this.stationMap.size,
            duplicatesSkipped: this.duplicateCount,
            errorsSkipped: this.errorCount
        };
    }
}

async function main() {
    console.log('🚂 Fetching European railway stations from OpenRailwayMap...');
    
    const client = new OpenRailwayMapClient();
    const processor = new StationDataProcessor();

    let totalQueries = 0;
    let totalStations = 0;

    // Create data directory if it doesn't exist
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Query for each major European city
    for (const city of EUROPEAN_CITIES) {
        console.log(`📍 Searching stations for: ${city}`);
        
        try {
            const stations = await client.searchStations(city, 100);
            totalQueries++;
            
            if (stations.length > 0) {
                console.log(`   Found ${stations.length} stations`);
                
                // Process each station
                stations.forEach(station => {
                    const processed = processor.processStation(station);
                    if (processed) {
                        totalStations++;
                    }
                });
            }
            
            // Rate limiting
            await client.sleep(client.requestDelay);
            
        } catch (error) {
            console.error(`❌ Error querying ${city}:`, error.message);
        }
    }

    // Get final processed data
    const uniqueStations = processor.getUniqueStations();
    const stats = processor.getStats();

    // Sort by country and name
    uniqueStations.sort((a, b) => {
        if (a.country !== b.country) {
            return a.country.localeCompare(b.country);
        }
        return a.name.localeCompare(b.name);
    });

    // Create output data structure
    const outputData = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalQueries: totalQueries,
            totalStations: stats.totalStations,
            duplicatesSkipped: stats.duplicatesSkipped,
            errorsSkipped: stats.errorsSkipped,
            dataSource: 'OpenRailwayMap API',
            apiVersion: 'v2'
        },
        stations: uniqueStations
    };

    // Write to file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2));

    console.log('\n✅ Station data fetching completed!');
    console.log(`📊 Stats:`);
    console.log(`   - Total queries: ${totalQueries}`);
    console.log(`   - Unique stations: ${stats.totalStations}`);
    console.log(`   - Duplicates skipped: ${stats.duplicatesSkipped}`);
    console.log(`   - Errors skipped: ${stats.errorsSkipped}`);
    console.log(`   - Output file: ${OUTPUT_FILE}`);

    // Display country breakdown
    const countryBreakdown = {};
    uniqueStations.forEach(station => {
        countryBreakdown[station.country] = (countryBreakdown[station.country] || 0) + 1;
    });

    console.log('\n🌍 Country breakdown:');
    Object.entries(countryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .forEach(([country, count]) => {
            console.log(`   ${country}: ${count} stations`);
        });
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
}

module.exports = { OpenRailwayMapClient, StationDataProcessor };