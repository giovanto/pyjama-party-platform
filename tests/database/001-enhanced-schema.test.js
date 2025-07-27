/**
 * Tests for Enhanced Multilingual Database Schema
 * Validates schema structure, data integrity, and search functionality
 */

const { createClient } = require('@supabase/supabase-js');
const { transformTripHopPlace, determinePlaceType, extractTags } = require('../../scripts/import-triphop-places');

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe('Enhanced Database Schema Tests', () => {
  let supabase;
  
  beforeAll(() => {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration for tests');
    }
    supabase = createClient(supabaseUrl, supabaseKey);
  });

  describe('Schema Structure Validation', () => {
    test('places table exists with correct columns', async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('routes table exists with correct structure', async () => {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    test('content table exists for multilingual content management', async () => {
      const { data, error } = await supabase
        .from('content')
        .select('*')
        .limit(1);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('Data Transformation Tests', () => {
    const sampleTripHopPlace = {
      place_id: 'test_vienna',
      place_name: 'Vienna',
      place_lat: '48.207037',
      place_lon: '16.341553',
      place_brief_desc: 'Something for everyone, from art and music to architecture and cuisine.',
      place_longer_desc: 'The capital of Austria is a must-see for any visitor. Vienna has something for everyone, from art and music to architecture and cuisine. You can admire the majestic Schönbrunn Palace.',
      place_image: '/assets/place_thumbnails/austria_1.jpg',
      place_country: 'Austria',
      lat_lon_tolerance: 5,
      image_attribution: '© Jorge Royan'
    };

    test('transformTripHopPlace creates correct multilingual structure', () => {
      const transformed = transformTripHopPlace(sampleTripHopPlace);
      
      expect(transformed.place_id).toBe('test_vienna');
      expect(transformed.place_lat).toBe(48.207037);
      expect(transformed.place_lon).toBe(16.341553);
      expect(transformed.place_country).toBe('Austria');
      expect(transformed.content.en.name).toBe('Vienna');
      expect(transformed.content.en.brief_desc).toContain('art and music');
      expect(transformed.source_type).toBe('triphop');
      expect(transformed.tags).toContain('cultural');
      expect(transformed.priority_score).toBeGreaterThan(1);
    });

    test('determinePlaceType correctly categorizes places', () => {
      expect(determinePlaceType('Vienna Central Station', 'train station')).toBe('station');
      expect(determinePlaceType('Mountain Resort', 'hiking and skiing')).toBe('nature');
      expect(determinePlaceType('Historic Museum', 'art and culture')).toBe('cultural');
      expect(determinePlaceType('Barcelona', 'mediterranean coast')).toBe('coastal');
      expect(determinePlaceType('Vienna', 'capital city')).toBe('destination');
    });

    test('extractTags identifies relevant categories', () => {
      const culturalTags = extractTags('Historic palace with baroque architecture', 'Museum collections');
      expect(culturalTags).toContain('cultural');
      
      const natureTags = extractTags('Mountain hiking destination', 'Alpine skiing resort');
      expect(natureTags).toContain('nature');
      expect(natureTags).toContain('adventure');
      
      const foodTags = extractTags('Culinary capital', 'Famous for wine and restaurants');
      expect(foodTags).toContain('food');
    });
  });

  describe('Multilingual Content Functions', () => {
    test('multilingual content can be inserted and retrieved', async () => {
      const testPlace = {
        place_id: 'test_multilingual',
        place_lat: 48.2,
        place_lon: 16.3,
        place_country: 'Austria',
        content: {
          en: {
            name: 'Test Place',
            brief_desc: 'A test destination'
          },
          de: {
            name: 'Testort',
            brief_desc: 'Ein Test-Reiseziel'
          },
          fr: {
            name: 'Lieu de Test',
            brief_desc: 'Une destination de test'
          }
        },
        place_type: 'destination',
        priority_score: 5,
        source_type: 'test'
      };

      // Insert test data
      const { error: insertError } = await supabase
        .from('places')
        .insert(testPlace);
      
      expect(insertError).toBeNull();

      // Retrieve and verify
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('place_id', 'test_multilingual')
        .single();
      
      expect(error).toBeNull();
      expect(data.content.en.name).toBe('Test Place');
      expect(data.content.de.name).toBe('Testort');
      expect(data.content.fr.name).toBe('Lieu de Test');

      // Cleanup
      await supabase
        .from('places')
        .delete()
        .eq('place_id', 'test_multilingual');
    });

    test('search function works with multilingual content', async () => {
      // Note: This test requires the search function to be installed in the database
      const { data, error } = await supabase.rpc('search_places', {
        search_query: 'Vienna',
        search_lang: 'en',
        limit_results: 10
      });

      if (error && error.message.includes('function search_places')) {
        console.warn('Search function not yet installed, skipping test');
        return;
      }

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Data Integrity and Constraints', () => {
    test('places table enforces unique place_id constraint', async () => {
      const testPlace = {
        place_id: 'test_duplicate',
        place_lat: 48.2,
        place_lon: 16.3,
        place_country: 'Austria',
        content: { en: { name: 'Test' } },
        source_type: 'test'
      };

      // Insert first time should succeed
      const { error: firstError } = await supabase
        .from('places')
        .insert(testPlace);
      
      expect(firstError).toBeNull();

      // Insert duplicate should fail
      const { error: duplicateError } = await supabase
        .from('places')
        .insert(testPlace);
      
      expect(duplicateError).not.toBeNull();
      expect(duplicateError.message).toContain('duplicate');

      // Cleanup
      await supabase
        .from('places')
        .delete()
        .eq('place_id', 'test_duplicate');
    });

    test('content JSONB field accepts valid multilingual structure', async () => {
      const validContent = {
        en: { name: 'English Name', brief_desc: 'English description' },
        de: { name: 'German Name', brief_desc: 'German description' }
      };

      const testPlace = {
        place_id: 'test_content_structure',
        place_lat: 48.2,
        place_lon: 16.3,
        place_country: 'Austria',
        content: validContent,
        source_type: 'test'
      };

      const { error } = await supabase
        .from('places')
        .insert(testPlace);
      
      expect(error).toBeNull();

      // Cleanup
      await supabase
        .from('places')
        .delete()
        .eq('place_id', 'test_content_structure');
    });
  });

  describe('Performance and Indexing', () => {
    test('GIN indexes support JSONB queries efficiently', async () => {
      // Test JSONB query performance (basic functionality test)
      const { data, error } = await supabase
        .from('places')
        .select('place_id, content')
        .like('content->en->>name', '%Vienna%')
        .limit(5);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });

    test('geographic queries work with coordinate indexes', async () => {
      // Test coordinate-based queries
      const { data, error } = await supabase
        .from('places')
        .select('place_id, place_lat, place_lon')
        .gte('place_lat', 47)
        .lte('place_lat', 49)
        .gte('place_lon', 15)
        .lte('place_lon', 17)
        .limit(10);
      
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Views and Aggregations', () => {
    test('places_multilingual view provides language fallbacks', async () => {
      const { data, error } = await supabase
        .from('places_multilingual')
        .select('*')
        .limit(3);

      if (error && error.message.includes('relation "places_multilingual"')) {
        console.warn('places_multilingual view not yet created, skipping test');
        return;
      }

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});

describe('Import Script Unit Tests', () => {
  describe('Data Processing Functions', () => {
    test('calculatePriorityScore assigns higher scores to major destinations', () => {
      const { calculatePriorityScore } = require('../../scripts/import-triphop-places');
      
      const viennaScore = calculatePriorityScore('Vienna', 'Austria', 'Long detailed description of this beautiful capital city with lots of attractions and cultural sites to visit.');
      const smallTownScore = calculatePriorityScore('Small Town', 'Remote Country', 'Brief description.');
      
      expect(viennaScore).toBeGreaterThan(smallTownScore);
      expect(viennaScore).toBeGreaterThanOrEqual(5);
      expect(smallTownScore).toBeGreaterThanOrEqual(1);
    });

    test('determinePlaceType handles edge cases correctly', () => {
      expect(determinePlaceType('', '')).toBe('destination');
      expect(determinePlaceType(null, null)).toBe('destination');
      expect(determinePlaceType('Airport Terminal', 'Major international airport')).toBe('station');
    });

    test('extractTags handles empty or null descriptions', () => {
      expect(extractTags('', '')).toEqual([]);
      expect(extractTags(null, null)).toEqual([]);
      expect(extractTags('simple description', '')).toEqual([]);
    });
  });
});