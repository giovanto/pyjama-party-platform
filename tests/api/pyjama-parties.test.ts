import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';
// Only run when a server URL is provided (e.g., http://localhost:3001)
const describeIfServer = BASE_URL ? describe : describe.skip;

describeIfServer('Pyjama Parties API', () => {
  let createdPartyId: string;

  afterAll(async () => {
    // Clean up created test data
    if (createdPartyId) {
      // In a real app, you might want to delete test data
      // For now, we'll leave it as test parties have a specific naming pattern
    }
  });

  describe('POST /api/pyjama-parties', () => {
    it('should create a new pyjama party successfully', async () => {
      const timestamp = Date.now();
      const partyData = {
        stationName: `Test Station Berlin ${timestamp}`,
        city: 'Berlin',
        country: 'Germany',
        organizerName: 'Test Organizer',
        organizerEmail: 'test@example.com',
        partyDate: '2025-09-26T19:00:00.000Z',
        description: 'Test pyjama party for API testing',
        expectedAttendees: 5
      };

      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partyData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message', 'Pyjama party created successfully!');
      expect(data).toHaveProperty('party');
      expect(data.party).toMatchObject({
        stationName: partyData.stationName,
        city: partyData.city,
        country: partyData.country,
        organizerName: partyData.organizerName,
        attendeesCount: partyData.expectedAttendees
      });

      createdPartyId = data.id;
    });

    it('should validate required fields', async () => {
      const incompleteData = {
        stationName: 'Test Station',
        city: 'Berlin'
        // Missing required fields
      };

      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incompleteData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Required fields missing');
    });

    it('should validate email format when provided', async () => {
      const invalidEmailData = {
        stationName: 'Test Station',
        city: 'Berlin',
        country: 'Germany',
        organizerName: 'Test Organizer',
        organizerEmail: 'invalid-email-format',
        partyDate: '2025-09-26T19:00:00.000Z',
        description: 'Test party',
        expectedAttendees: 5
      };

      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidEmailData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Invalid email format');
    });

    it('should validate date format', async () => {
      const invalidDateData = {
        stationName: 'Test Station',
        city: 'Berlin',
        country: 'Germany',
        organizerName: 'Test Organizer',
        partyDate: 'invalid-date',
        description: 'Test party',
        expectedAttendees: 5
      };

      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidDateData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Invalid date format');
    });

    it('should prevent duplicate parties for same station and date', async () => {
      const partyData = {
        stationName: 'Unique Test Station',
        city: 'Munich',
        country: 'Germany',
        organizerName: 'First Organizer',
        partyDate: '2025-09-26T19:00:00.000Z',
        description: 'First party',
        expectedAttendees: 3
      };

      // Create first party
      await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partyData),
      });

      // Try to create duplicate party
      const duplicateData = {
        ...partyData,
        organizerName: 'Second Organizer',
        description: 'Duplicate party'
      };

      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      });

      expect(response.status).toBe(409);
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('already organized');
    });
  });

  describe('GET /api/pyjama-parties', () => {
    it('should fetch all parties with pagination', async () => {
      const response = await fetch(`${BASE_URL}/api/pyjama-parties?limit=10&offset=0`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('parties');
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('limit', 10);
      expect(data).toHaveProperty('offset', 0);
      expect(Array.isArray(data.parties)).toBe(true);
    });

    it('should filter parties by station', async () => {
      const response = await fetch(`${BASE_URL}/api/pyjama-parties?station=Berlin`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('parties');
      expect(Array.isArray(data.parties)).toBe(true);
      
      // Check that returned parties contain "Berlin" in station name
      data.parties.forEach((party: any) => {
        expect(party.stationName.toLowerCase()).toContain('berlin');
      });
    });

    it('should filter upcoming parties only', async () => {
      const response = await fetch(`${BASE_URL}/api/pyjama-parties?upcoming=true`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('parties');
      expect(Array.isArray(data.parties)).toBe(true);
      
      const now = new Date();
      data.parties.forEach((party: any) => {
        expect(new Date(party.partyDate) >= now).toBe(true);
      });
    });

    it('should handle pagination limits', async () => {
      const response = await fetch(`${BASE_URL}/api/pyjama-parties?limit=2&offset=0`);
      
      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('limit', 2);
      expect(data.parties.length).toBeLessThanOrEqual(2);
    });
  });

  describe('PUT /api/pyjama-parties', () => {
    it('should update party attendees count', async () => {
      if (!createdPartyId) {
        // Create a party first for testing
        const createResponse = await fetch(`${BASE_URL}/api/pyjama-parties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stationName: 'Update Test Station',
            city: 'Vienna',
            country: 'Austria',
            organizerName: 'Update Tester',
            partyDate: '2025-09-26T19:00:00.000Z',
            description: 'Party for update testing',
            expectedAttendees: 5
          }),
        });
        const createData = await createResponse.json();
        createdPartyId = createData.id;
      }

      const updateData = {
        id: createdPartyId,
        attendeesCount: 10,
        status: 'confirmed'
      };

      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message', 'Pyjama party updated successfully!');
      expect(data.party).toMatchObject({
        attendeesCount: 10,
        status: 'confirmed'
      });
    });

    it('should require party ID for updates', async () => {
      const updateData = {
        attendeesCount: 10
        // Missing ID
      };

      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Party ID is required');
    });

    it('should update party description', async () => {
      if (!createdPartyId) return; // Skip if no test party available

      const updateData = {
        id: createdPartyId,
        description: 'Updated party description for testing'
      };

      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      
      expect(data).toHaveProperty('success', true);
      expect(data.party.description).toBe(updateData.description);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid-json',
      });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Internal server error');
    });

    it('should handle missing Content-Type header', async () => {
      const response = await fetch(`${BASE_URL}/api/pyjama-parties`, {
        method: 'POST',
        body: JSON.stringify({
          stationName: 'Test Station',
          city: 'Berlin',
          country: 'Germany',
          organizerName: 'Test Organizer',
          partyDate: '2025-09-26T19:00:00.000Z',
          description: 'Test party'
        }),
      });

      // Should still work or give appropriate error (409 for duplicate is also acceptable)
      expect([201, 400, 409, 500]).toContain(response.status);
    });
  });
});
