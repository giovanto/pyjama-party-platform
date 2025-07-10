/**
 * Test Utilities
 * Helper functions and custom render for testing
 */

import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Mock SWR to avoid data fetching in tests
vi.mock('swr', () => ({
  default: (key: any, fetcher: any) => ({
    data: undefined,
    error: null,
    isLoading: false,
    mutate: vi.fn(),
  }),
}));

// Custom render function with providers
interface CustomRenderOptions extends RenderOptions {
  // Add any providers here if needed (e.g., theme, router, etc.)
}

function render(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Helper functions for common test scenarios
export const mockDream = {
  id: '1',
  dreamer_name: 'Test User',
  origin_station: 'Berlin Hauptbahnhof',
  origin_country: 'DE',
  origin_lat: 52.5251,
  origin_lng: 13.3691,
  destination_city: 'Barcelona beach sunrise',
  destination_country: 'ES',
  destination_lat: 41.3851,
  destination_lng: 2.1734,
  email: 'test@example.com',
  email_verified: false,
  created_at: new Date('2024-01-01').toISOString(),
  expires_at: new Date('2024-01-31').toISOString(),
};

export const mockStation = {
  id: '1',
  name: 'Berlin Hauptbahnhof',
  country: 'DE',
  country_name: 'Germany',
  city: 'Berlin',
  lat: 52.5251,
  lng: 13.3691,
  station_type: 'station',
};

export const mockStats = {
  total_dreams: 10,
  active_stations: 5,
  communities_forming: 2,
  last_updated: new Date().toISOString(),
};

// Create mock form data
export const createMockFormData = (overrides = {}) => ({
  dreamer_name: 'Test User',
  origin_station: 'Berlin Hauptbahnhof',
  destination_city: 'Barcelona beach sunrise',
  email: 'test@example.com',
  ...overrides,
});

// Wait for component to settle
export const waitForComponent = () => new Promise(resolve => setTimeout(resolve, 0));

// Re-export everything from RTL
export * from '@testing-library/react';
export { render };