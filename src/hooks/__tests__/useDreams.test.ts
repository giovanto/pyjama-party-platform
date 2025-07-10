/**
 * useDreams Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDreams } from '../useDreams';
import { mockDreams } from '../../test/mocks/server';

// Mock SWR
const mockMutate = vi.fn();
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    if (key?.[0] === 'dreams') {
      return {
        data: mockDreams,
        error: null,
        isLoading: false,
        mutate: mockMutate,
      };
    }
    return {
      data: undefined,
      error: null,
      isLoading: false,
      mutate: vi.fn(),
    };
  }),
}));

// Mock API
vi.mock('../../services/api', () => ({
  api: {
    dreams: {
      getDreams: vi.fn().mockResolvedValue(mockDreams),
    },
  },
}));

describe('useDreams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns dreams data', () => {
    const { result } = renderHook(() => useDreams());
    
    expect(result.current.dreams).toEqual(mockDreams);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('returns empty array when no dreams data', () => {
    // Mock SWR to return undefined data
    vi.mocked(vi.importActual('swr')).default.mockReturnValueOnce({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => useDreams());
    
    expect(result.current.dreams).toEqual([]);
  });

  it('handles loading state', () => {
    // Mock SWR to return loading state
    vi.mocked(vi.importActual('swr')).default.mockReturnValueOnce({
      data: undefined,
      error: null,
      isLoading: true,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => useDreams());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.dreams).toEqual([]);
  });

  it('handles error state', () => {
    const mockError = new Error('Failed to fetch dreams');
    
    // Mock SWR to return error state
    vi.mocked(vi.importActual('swr')).default.mockReturnValueOnce({
      data: undefined,
      error: mockError,
      isLoading: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => useDreams());
    
    expect(result.current.error).toBe(mockError);
    expect(result.current.dreams).toEqual([]);
  });

  it('provides addDream function', () => {
    const { result } = renderHook(() => useDreams());
    
    expect(typeof result.current.addDream).toBe('function');
  });

  it('provides refresh function', () => {
    const { result } = renderHook(() => useDreams());
    
    expect(typeof result.current.refresh).toBe('function');
    expect(result.current.refresh).toBe(mockMutate);
  });

  it('optimistically adds dream when addDream is called', async () => {
    const { result } = renderHook(() => useDreams());
    
    const newDream = {
      id: 'temp-123',
      dreamer_name: 'New Dreamer',
      origin_station: 'Paris Gare du Nord',
      destination_city: 'Rome morning vista',
    };

    // Call addDream
    await result.current.addDream(newDream);
    
    // Should call mutate with optimistic update
    expect(mockMutate).toHaveBeenCalled();
  });

  it('accepts parameters for pagination', () => {
    const params = { limit: 50, offset: 10 };
    renderHook(() => useDreams(params));
    
    // SWR should be called with the parameters
    expect(vi.mocked(vi.importActual('swr')).default).toHaveBeenCalledWith(
      ['dreams', params],
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('uses proper SWR configuration', () => {
    renderHook(() => useDreams());
    
    // Check SWR was called with proper config
    const swrCall = vi.mocked(vi.importActual('swr')).default.mock.calls[0];
    const config = swrCall[2];
    
    expect(config).toMatchObject({
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    });
  });

  it('handles optimistic update correctly', async () => {
    const { result } = renderHook(() => useDreams());
    
    const partialDream = {
      dreamer_name: 'Test User',
      origin_station: 'Test Station',
      destination_city: 'Test Destination',
    };

    await result.current.addDream(partialDream);
    
    // Verify mutate was called with properly formatted dream
    expect(mockMutate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringContaining('temp-'),
          dreamer_name: 'Test User',
          origin_station: 'Test Station',
          destination_city: 'Test Destination',
          created_at: expect.any(String),
          expires_at: expect.any(String),
          email_verified: false,
        }),
        ...mockDreams,
      ]),
      false
    );
  });

  it('does not add dream when dreams data is not available', async () => {
    // Mock SWR to return no data
    vi.mocked(vi.importActual('swr')).default.mockReturnValueOnce({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: mockMutate,
    });

    const { result } = renderHook(() => useDreams());
    
    await result.current.addDream({ dreamer_name: 'Test' });
    
    // Should not call mutate when no dreams data
    expect(mockMutate).not.toHaveBeenCalled();
  });
});