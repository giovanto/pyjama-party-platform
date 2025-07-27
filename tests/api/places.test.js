/**
 * Tests for Places API Endpoints
 * Validates search functionality, validation, and multilingual support
 */

const { validatePlacesSearchQuery, validatePlaceDetailsQuery, validateDreamSubmission } = require('../../src/lib/validation');

describe('Places API Validation Tests', () => {
  describe('Places Search Query Validation', () => {
    test('validates basic search query', () => {
      const query = {
        q: 'Vienna',
        lang: 'en',
        limit: '10'
      };

      const result = validatePlacesSearchQuery(query);
      expect(result.success).toBe(true);
      expect(result.data.q).toBe('Vienna');
      expect(result.data.lang).toBe('en');
      expect(result.data.limit).toBe(10);
    });

    test('applies default values correctly', () => {
      const query = {};

      const result = validatePlacesSearchQuery(query);
      expect(result.success).toBe(true);
      expect(result.data.lang).toBe('en');
      expect(result.data.limit).toBe(50);
      expect(result.data.offset).toBe(0);
    });

    test('validates proximity search parameters', () => {
      const query = {
        lat: '48.2',
        lon: '16.3',
        radius: '50'
      };

      const result = validatePlacesSearchQuery(query);
      expect(result.success).toBe(true);
      expect(result.data.lat).toBe(48.2);
      expect(result.data.lon).toBe(16.3);
      expect(result.data.radius).toBe(50);
    });

    test('rejects invalid proximity search (missing longitude)', () => {
      const query = {
        lat: '48.2'
        // Missing lon
      };

      const result = validatePlacesSearchQuery(query);
      expect(result.success).toBe(false);
    });

    test('validates search query length limits', () => {
      const longQuery = 'a'.repeat(250); // Too long
      const query = {
        q: longQuery
      };

      const result = validatePlacesSearchQuery(query);
      expect(result.success).toBe(false);
    });

    test('validates supported languages', () => {
      const validLang = {
        lang: 'de'
      };
      const invalidLang = {
        lang: 'xyz'
      };

      const validResult = validatePlacesSearchQuery(validLang);
      const invalidResult = validatePlacesSearchQuery(invalidLang);

      expect(validResult.success).toBe(true);
      expect(invalidResult.success).toBe(false);
    });

    test('validates coordinate bounds', () => {
      const invalidCoords = {
        lat: '100', // Invalid latitude
        lon: '200'  // Invalid longitude
      };

      const result = validatePlacesSearchQuery(invalidCoords);
      expect(result.success).toBe(false);
    });

    test('validates limit bounds', () => {
      const queries = [
        { limit: '0' },   // Too low
        { limit: '150' }, // Too high
        { limit: '50' }   // Valid
      ];

      const results = queries.map(validatePlacesSearchQuery);
      
      expect(results[0].success).toBe(false); // Too low
      expect(results[1].success).toBe(false); // Too high
      expect(results[2].success).toBe(true);  // Valid
    });
  });

  describe('Place Details Query Validation', () => {
    test('validates place details query with defaults', () => {
      const query = {};

      const result = validatePlaceDetailsQuery(query);
      expect(result.success).toBe(true);
      expect(result.data.lang).toBe('en');
      expect(result.data.include_related).toBe(true);
      expect(result.data.include_stations).toBe(true);
      expect(result.data.include_routes).toBe(true);
    });

    test('validates boolean parameters', () => {
      const query = {
        include_related: 'false',
        include_stations: 'true',
        include_routes: '0'
      };

      const result = validatePlaceDetailsQuery(query);
      expect(result.success).toBe(true);
      expect(result.data.include_related).toBe(false);
      expect(result.data.include_stations).toBe(true);
      expect(result.data.include_routes).toBe(false);
    });
  });

  describe('Dream Submission Validation', () => {
    const validDreamData = {
      from: 'Vienna, Austria',
      to: 'Barcelona, Spain',
      dreamerName: 'John Doe',
      email: 'john@example.com',
      why: 'I want to travel sustainably and enjoy the scenic route through the European countryside.',
      routeType: 'night_train',
      travelPurpose: 'tourism'
    };

    test('validates complete dream submission', () => {
      const result = validateDreamSubmission(validDreamData);
      expect(result.success).toBe(true);
      expect(result.data.from).toBe('Vienna, Austria');
      expect(result.data.routeType).toBe('night_train');
    });

    test('validates minimum required fields', () => {
      const minimalData = {
        from: 'Vienna',
        to: 'Barcelona',
        dreamerName: 'John',
        why: 'I want sustainable travel options for exploring Europe.'
      };

      const result = validateDreamSubmission(minimalData);
      expect(result.success).toBe(true);
      expect(result.data.routeType).toBe('night_train'); // Default value
    });

    test('rejects invalid email format', () => {
      const invalidEmailData = {
        ...validDreamData,
        email: 'invalid-email'
      };

      const result = validateDreamSubmission(invalidEmailData);
      expect(result.success).toBe(false);
    });

    test('rejects same origin and destination', () => {
      const sameLocationData = {
        ...validDreamData,
        from: 'Vienna',
        to: 'Vienna'
      };

      const result = validateDreamSubmission(sameLocationData);
      expect(result.success).toBe(false);
    });

    test('validates why field length', () => {
      const shortWhyData = {
        ...validDreamData,
        why: 'Short'  // Too short
      };

      const longWhyData = {
        ...validDreamData,
        why: 'a'.repeat(2500)  // Too long
      };

      const shortResult = validateDreamSubmission(shortWhyData);
      const longResult = validateDreamSubmission(longWhyData);

      expect(shortResult.success).toBe(false);
      expect(longResult.success).toBe(false);
    });

    test('validates route types', () => {
      const validRouteTypes = ['night_train', 'day_train', 'bus', 'mixed'];
      const invalidRouteType = {
        ...validDreamData,
        routeType: 'airplane'
      };

      // Test valid route types
      for (const routeType of validRouteTypes) {
        const data = { ...validDreamData, routeType };
        const result = validateDreamSubmission(data);
        expect(result.success).toBe(true);
      }

      // Test invalid route type
      const invalidResult = validateDreamSubmission(invalidRouteType);
      expect(invalidResult.success).toBe(false);
    });

    test('trims whitespace from string fields', () => {
      const dataWithWhitespace = {
        from: '  Vienna, Austria  ',
        to: '  Barcelona, Spain  ',
        dreamerName: '  John Doe  ',
        why: '  I want sustainable travel.  '
      };

      const result = validateDreamSubmission(dataWithWhitespace);
      expect(result.success).toBe(true);
      expect(result.data.from).toBe('Vienna, Austria');
      expect(result.data.to).toBe('Barcelona, Spain');
      expect(result.data.dreamerName).toBe('John Doe');
      expect(result.data.why).toBe('I want sustainable travel.');
    });
  });
});

describe('API Integration Tests', () => {
  // Note: These tests would require a test database setup
  // For now, we're testing validation logic only
  
  describe('Search Query Processing', () => {
    test('constructs proper search parameters', () => {
      const searchParams = new URLSearchParams({
        q: 'Vienna',
        lang: 'de',
        country: 'Austria',
        limit: '20'
      });

      const queryObject = Object.fromEntries(searchParams);
      const validation = validatePlacesSearchQuery(queryObject);

      expect(validation.success).toBe(true);
      expect(validation.data.q).toBe('Vienna');
      expect(validation.data.lang).toBe('de');
      expect(validation.data.country).toBe('Austria');
      expect(validation.data.limit).toBe(20);
    });

    test('handles empty search parameters', () => {
      const emptyParams = {};
      const validation = validatePlacesSearchQuery(emptyParams);

      expect(validation.success).toBe(true);
      expect(validation.data.lang).toBe('en');
      expect(validation.data.limit).toBe(50);
      expect(validation.data.offset).toBe(0);
    });
  });

  describe('Response Format Validation', () => {
    test('validates expected response structure', () => {
      const mockPlaceResponse = {
        place_id: 'austria_1',
        name: 'Vienna',
        brief_description: 'Capital of Austria',
        longer_description: 'Vienna is the capital and largest city of Austria.',
        country: 'Austria',
        latitude: 48.207037,
        longitude: 16.341553,
        place_type: 'destination',
        priority_score: 8,
        tags: ['cultural', 'urban'],
        image_url: '/assets/place_thumbnails/austria_1.jpg',
        image_attribution: '© Jorge Royan'
      };

      // Test that our mock data matches expected interface
      expect(mockPlaceResponse.place_id).toBeDefined();
      expect(typeof mockPlaceResponse.latitude).toBe('number');
      expect(typeof mockPlaceResponse.longitude).toBe('number');
      expect(Array.isArray(mockPlaceResponse.tags)).toBe(true);
    });
  });
});