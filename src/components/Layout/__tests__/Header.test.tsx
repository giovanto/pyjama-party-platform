/**
 * Header Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockStats } from '../../../test/utils';
import { Header } from '../Header';

// Mock the useStats hook
vi.mock('../../../hooks', () => ({
  useStats: () => ({
    stats: mockStats,
    isLoading: false,
    error: null,
  }),
}));

describe('Header', () => {
  const user = userEvent.setup();
  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and subtitle', () => {
    render(<Header />);
    
    expect(screen.getByText(/pajama party platform/i)).toBeInTheDocument();
    expect(screen.getByText(/european train adventure dreams/i)).toBeInTheDocument();
  });

  it('displays the train emoji logo', () => {
    render(<Header />);
    
    expect(screen.getByText('🚂')).toBeInTheDocument();
  });

  it('shows navigation buttons', () => {
    render(<Header onNavigate={mockOnNavigate} />);
    
    expect(screen.getByRole('button', { name: /map/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add dream/i })).toBeInTheDocument();
  });

  it('calls onNavigate when navigation buttons are clicked', async () => {
    render(<Header onNavigate={mockOnNavigate} />);
    
    const mapButton = screen.getByRole('button', { name: /map/i });
    const addDreamButton = screen.getByRole('button', { name: /add dream/i });
    
    await user.click(mapButton);
    expect(mockOnNavigate).toHaveBeenCalledWith('map');
    
    await user.click(addDreamButton);
    expect(mockOnNavigate).toHaveBeenCalledWith('form');
  });

  it('displays stats when showStats is true', () => {
    render(<Header showStats={true} />);
    
    expect(screen.getByText(mockStats.total_dreams.toString())).toBeInTheDocument();
    expect(screen.getByText(mockStats.active_stations.toString())).toBeInTheDocument();
    expect(screen.getByText(mockStats.communities_forming.toString())).toBeInTheDocument();
    
    expect(screen.getByText(/dreams/i)).toBeInTheDocument();
    expect(screen.getByText(/stations/i)).toBeInTheDocument();
    expect(screen.getByText(/communities/i)).toBeInTheDocument();
  });

  it('hides stats when showStats is false', () => {
    render(<Header showStats={false} />);
    
    expect(screen.queryByText(mockStats.total_dreams.toString())).not.toBeInTheDocument();
    expect(screen.queryByText(/dreams/i)).not.toBeInTheDocument();
  });

  it('shows loading state for stats', () => {
    // Mock loading state
    vi.mocked(vi.importActual('../../../hooks')).useStats = () => ({
      stats: null,
      isLoading: true,
      error: null,
    });

    render(<Header showStats={true} />);
    
    // Loading skeletons should be visible
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('shows error state when stats fail to load', () => {
    // Mock error state
    vi.mocked(vi.importActual('../../../hooks')).useStats = () => ({
      stats: null,
      isLoading: false,
      error: new Error('Failed to load stats'),
    });

    render(<Header showStats={true} />);
    
    expect(screen.getByText(/stats unavailable/i)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Header className="custom-header" />);
    
    expect(container.firstChild).toHaveClass('custom-header');
  });

  it('displays mobile stats layout on small screens', () => {
    render(<Header showStats={true} />);
    
    // Both desktop and mobile stats should be in DOM, hidden by CSS
    expect(screen.getAllByText(mockStats.total_dreams.toString())).toHaveLength(2);
  });

  it('has proper semantic structure', () => {
    render(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    
    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveTextContent(/pajama party platform/i);
  });

  it('renders without onNavigate callback', () => {
    render(<Header />);
    
    const mapButton = screen.getByRole('button', { name: /map/i });
    expect(mapButton).toBeInTheDocument();
    
    // Should not throw when clicked without callback
    fireEvent.click(mapButton);
  });

  it('has accessible button styles', () => {
    render(<Header onNavigate={mockOnNavigate} />);
    
    const mapButton = screen.getByRole('button', { name: /map/i });
    const addDreamButton = screen.getByRole('button', { name: /add dream/i });
    
    expect(mapButton).toHaveClass('transition-colors');
    expect(addDreamButton).toHaveClass('bg-blue-600');
  });
});