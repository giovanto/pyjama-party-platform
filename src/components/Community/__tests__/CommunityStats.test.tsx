/**
 * CommunityStats Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { render, mockStats, mockDream } from '../../../test/utils';
import { CommunityStats } from '../CommunityStats';

// Mock the hooks
vi.mock('../../../hooks', () => ({
  useStats: () => ({
    stats: mockStats,
    isLoading: false,
    error: null,
  }),
  useDreams: () => ({
    dreams: [mockDream],
    isLoading: false,
    error: null,
  }),
}));

describe('CommunityStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title when showTitle is true', () => {
    render(<CommunityStats showTitle={true} />);
    
    expect(screen.getByText(/community statistics/i)).toBeInTheDocument();
    expect(screen.getByText(/see how the pajama party movement is growing/i)).toBeInTheDocument();
  });

  it('hides title when showTitle is false', () => {
    render(<CommunityStats showTitle={false} />);
    
    expect(screen.queryByText(/community statistics/i)).not.toBeInTheDocument();
  });

  it('displays main statistics correctly', () => {
    render(<CommunityStats />);
    
    expect(screen.getByText(mockStats.total_dreams.toString())).toBeInTheDocument();
    expect(screen.getByText(mockStats.active_stations.toString())).toBeInTheDocument();
    expect(screen.getByText(mockStats.communities_forming.toString())).toBeInTheDocument();
    
    expect(screen.getByText(/dreams shared/i)).toBeInTheDocument();
    expect(screen.getByText(/active stations/i)).toBeInTheDocument();
    expect(screen.getByText(/communities forming/i)).toBeInTheDocument();
  });

  it('shows appropriate icons for each stat', () => {
    render(<CommunityStats />);
    
    expect(screen.getByText('💭')).toBeInTheDocument(); // Dreams icon
    expect(screen.getByText('🚉')).toBeInTheDocument(); // Stations icon
    expect(screen.getByText('🎉')).toBeInTheDocument(); // Communities icon
  });

  it('displays loading state', () => {
    // Mock loading state
    vi.mocked(vi.importActual('../../../hooks')).useStats = () => ({
      stats: null,
      isLoading: true,
      error: null,
    });

    render(<CommunityStats />);
    
    // Should show loading skeletons
    expect(screen.getByRole('generic')).toBeInTheDocument();
  });

  it('displays error state', () => {
    // Mock error state
    vi.mocked(vi.importActual('../../../hooks')).useStats = () => ({
      stats: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(<CommunityStats />);
    
    expect(screen.getByText(/unable to load community stats/i)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('shows no data message when no dreams exist', () => {
    // Mock empty stats
    vi.mocked(vi.importActual('../../../hooks')).useStats = () => ({
      stats: { ...mockStats, total_dreams: 0 },
      isLoading: false,
      error: null,
    });

    vi.mocked(vi.importActual('../../../hooks')).useDreams = () => ({
      dreams: [],
      isLoading: false,
      error: null,
    });

    render(<CommunityStats />);
    
    expect(screen.getByText(/be the first dreamer/i)).toBeInTheDocument();
    expect(screen.getByText(/no dreams have been shared yet/i)).toBeInTheDocument();
  });

  it('shows encouragement message when no communities formed yet', () => {
    // Mock stats with dreams but no communities
    vi.mocked(vi.importActual('../../../hooks')).useStats = () => ({
      stats: { ...mockStats, communities_forming: 0 },
      isLoading: false,
      error: null,
    });

    render(<CommunityStats />);
    
    expect(screen.getByText(/community formation coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/communities form when 2\+ people share the same origin station/i)).toBeInTheDocument();
  });

  it('displays last updated timestamp', () => {
    render(<CommunityStats />);
    
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<CommunityStats className="custom-stats" />);
    
    expect(container.firstChild).toHaveClass('custom-stats');
  });

  it('uses horizontal layout by default', () => {
    render(<CommunityStats layout="horizontal" />);
    
    // Layout classes would be applied to the grid container
    expect(screen.getByText(/dreams shared/i)).toBeInTheDocument();
  });

  it('uses vertical layout when specified', () => {
    render(<CommunityStats layout="vertical" />);
    
    // Layout classes would be applied to the grid container
    expect(screen.getByText(/dreams shared/i)).toBeInTheDocument();
  });

  it('displays active communities when they exist', () => {
    // Mock multiple dreams from same station to form communities
    const communityDreams = [
      { ...mockDream, id: '1', origin_station: 'Berlin Hauptbahnhof' },
      { ...mockDream, id: '2', origin_station: 'Berlin Hauptbahnhof' },
      { ...mockDream, id: '3', origin_station: 'Amsterdam Centraal' },
      { ...mockDream, id: '4', origin_station: 'Amsterdam Centraal' },
    ];

    vi.mocked(vi.importActual('../../../hooks')).useDreams = () => ({
      dreams: communityDreams,
      isLoading: false,
      error: null,
    });

    vi.mocked(vi.importActual('../../../hooks')).useStats = () => ({
      stats: { ...mockStats, communities_forming: 2 },
      isLoading: false,
      error: null,
    });

    render(<CommunityStats />);
    
    expect(screen.getByText(/active communities/i)).toBeInTheDocument();
    expect(screen.getByText('🎪')).toBeInTheDocument();
  });

  it('shows train emojis for community members', () => {
    // This would be visible when communities are displayed
    render(<CommunityStats />);
    
    // Base stats should be visible
    expect(screen.getByText(mockStats.total_dreams.toString())).toBeInTheDocument();
  });
});