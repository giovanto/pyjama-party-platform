/**
 * Test Setup Configuration
 * Global test setup for vitest and testing-library
 */

import '@testing-library/jest-dom';
import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Mock environment variables
Object.assign(import.meta.env, {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-key',
  VITE_MAPBOX_ACCESS_TOKEN: 'test-token',
  DEV: true,
  PROD: false,
});

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn(() => ({
      on: vi.fn(),
      remove: vi.fn(),
      addControl: vi.fn(),
      addSource: vi.fn(),
      addLayer: vi.fn(),
      flyTo: vi.fn(),
      fitBounds: vi.fn(),
    })),
    NavigationControl: vi.fn(),
    AttributionControl: vi.fn(),
    Marker: vi.fn(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      getLngLat: vi.fn(() => ({ lat: 0, lng: 0 })),
    })),
    Popup: vi.fn(() => ({
      setHTML: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
    })),
    LngLatBounds: vi.fn(() => ({
      extend: vi.fn().mockReturnThis(),
      isEmpty: vi.fn(() => false),
    })),
  },
  accessToken: '',
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch if not available
if (!globalThis.fetch) {
  globalThis.fetch = vi.fn();
}

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any request handlers that are declared as a part of our tests
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});