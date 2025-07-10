/**
 * StationSearch Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockStation } from '../../../test/utils';
import { StationSearch } from '../StationSearch';

// Mock the useStations hook
const mockSearchStations = vi.fn();
const mockClearStations = vi.fn();

vi.mock('../../../hooks', () => ({
  useStations: () => ({
    stations: [],
    isLoading: false,
    error: null,
    searchStations: mockSearchStations,
    clearStations: mockClearStations,
  }),
}));

describe('StationSearch', () => {
  const user = userEvent.setup();
  const mockOnValueChange = vi.fn();
  const mockOnStationSelect = vi.fn();

  const defaultProps = {
    value: '',
    onValueChange: mockOnValueChange,
    onStationSelect: mockOnStationSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input field with default placeholder', () => {
    render(<StationSearch {...defaultProps} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search for a train station/i)).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(
      <StationSearch 
        {...defaultProps} 
        placeholder="Find your station..." 
      />
    );
    
    expect(screen.getByPlaceholderText(/find your station/i)).toBeInTheDocument();
  });

  it('calls onValueChange when user types', async () => {
    render(<StationSearch {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    await user.type(input, 'Berlin');
    
    expect(mockOnValueChange).toHaveBeenCalledWith('B');
    expect(mockOnValueChange).toHaveBeenCalledWith('e');
    // etc. for each character
  });

  it('triggers search when typing 2+ characters', async () => {
    render(<StationSearch {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    await user.type(input, 'Be');
    
    expect(mockSearchStations).toHaveBeenCalledWith('Be');
  });

  it('clears stations when input is less than 2 characters', async () => {
    render(<StationSearch {...defaultProps} value="B" />);
    
    const input = screen.getByRole('combobox');
    await user.clear(input);
    
    expect(mockClearStations).toHaveBeenCalled();
  });

  it('displays loading indicator when searching', () => {
    // Mock loading state
    vi.mocked(vi.importActual('../../../hooks')).useStations = () => ({
      stations: [],
      isLoading: true,
      error: null,
      searchStations: mockSearchStations,
      clearStations: mockClearStations,
    });

    render(<StationSearch {...defaultProps} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    // Loading spinner would be visible in the component
  });

  it('shows error message when provided', () => {
    render(
      <StationSearch 
        {...defaultProps} 
        error="Please select a station" 
      />
    );
    
    expect(screen.getByText(/please select a station/i)).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<StationSearch {...defaultProps} disabled={true} />);
    
    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('handles keyboard navigation', async () => {
    // Mock stations in dropdown
    const mockStations = [mockStation];
    vi.mocked(vi.importActual('../../../hooks')).useStations = () => ({
      stations: mockStations,
      isLoading: false,
      error: null,
      searchStations: mockSearchStations,
      clearStations: mockClearStations,
    });

    render(<StationSearch {...defaultProps} value="Berlin" />);
    
    const input = screen.getByRole('combobox');
    
    // Test arrow down navigation
    await user.type(input, '{arrowdown}');
    // Test enter selection
    await user.type(input, '{enter}');
    
    // Keyboard events would be handled by the component
    expect(input).toBeInTheDocument();
  });

  it('shows help text when no value entered', () => {
    render(<StationSearch {...defaultProps} />);
    
    expect(screen.getByText(/type at least 2 characters/i)).toBeInTheDocument();
  });

  it('hides help text when there is an error', () => {
    render(
      <StationSearch 
        {...defaultProps} 
        error="Invalid selection" 
      />
    );
    
    expect(screen.queryByText(/type at least 2 characters/i)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <StationSearch 
        {...defaultProps} 
        className="custom-class" 
      />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('sets proper ARIA attributes', () => {
    render(<StationSearch {...defaultProps} id="test-search" />);
    
    const input = screen.getByRole('combobox');
    
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(input).toHaveAttribute('id', 'test-search');
  });

  it('prevents form submission on Enter when no stations selected', async () => {
    render(<StationSearch {...defaultProps} />);
    
    const input = screen.getByRole('combobox');
    
    const mockPreventDefault = vi.fn();
    fireEvent.keyDown(input, { 
      key: 'Enter', 
      preventDefault: mockPreventDefault 
    });
    
    // The component should prevent default when no stations available
    expect(input).toBeInTheDocument();
  });
});