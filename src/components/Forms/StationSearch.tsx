/**
 * StationSearch Component
 * Autocomplete search input for European train stations
 */

import React, { useState, useRef, useEffect } from 'react';
import { useStations } from '../../hooks';
import type { StationSearchProps, Station } from '../../types';

export function StationSearch({
  id = 'station-search',
  placeholder = 'Search for a train station...',
  value,
  onValueChange,
  onStationSelect,
  error,
  disabled = false,
  className = '',
}: StationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const {
    stations,
    isLoading,
    searchStations,
    clearStations,
  } = useStations({
    debounceMs: 300,
    minQueryLength: 2,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onValueChange(newValue);
    
    if (newValue.trim().length >= 2) {
      searchStations(newValue);
      setIsOpen(true);
    } else {
      clearStations();
      setIsOpen(false);
    }
    
    setHighlightedIndex(-1);
  };

  // Handle station selection
  const handleStationSelect = (station: Station) => {
    onValueChange(station.name);
    onStationSelect(station);
    setIsOpen(false);
    setHighlightedIndex(-1);
    clearStations();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || stations.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < stations.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : stations.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < stations.length) {
          handleStationSelect(stations[highlightedIndex]);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    if (value.trim().length >= 2 && stations.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle input blur (delayed to allow for clicks)
  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [highlightedIndex]);

  // Format station display
  const formatStation = (station: Station) => {
    const parts = [station.name];
    if (station.city && station.city !== station.name) {
      parts.push(station.city);
    }
    parts.push(station.country_name);
    return parts.join(', ');
  };

  // Get station flag emoji
  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'AT': '🇦🇹', 'BE': '🇧🇪', 'CH': '🇨🇭', 'CZ': '🇨🇿',
      'DE': '🇩🇪', 'DK': '🇩🇰', 'ES': '🇪🇸', 'FI': '🇫🇮',
      'FR': '🇫🇷', 'GB': '🇬🇧', 'IT': '🇮🇹', 'NL': '🇳🇱',
      'NO': '🇳🇴', 'PL': '🇵🇱', 'PT': '🇵🇹', 'SE': '🇸🇪',
    };
    return flags[countryCode] || '🚉';
  };

  const baseInputClasses = `
    w-full px-4 py-3 border rounded-lg 
    text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    transition-colors duration-200
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
  `;

  const dropdownClasses = `
    absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg
    max-h-60 overflow-auto
  `;

  const optionClasses = (index: number) => `
    px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0
    transition-colors duration-150
    ${index === highlightedIndex 
      ? 'bg-blue-50 text-blue-900' 
      : 'hover:bg-gray-50 text-gray-900'
    }
  `;

  return (
    <div className={`relative ${className}`}>
      {/* Input Field */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={baseInputClasses}
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-describedby={error ? `${id}-error` : undefined}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && stations.length > 0 && (
        <ul
          ref={listRef}
          className={dropdownClasses}
          role="listbox"
          aria-label="Station suggestions"
        >
          {stations.map((station, index) => (
            <li
              key={station.id}
              className={optionClasses(index)}
              onClick={() => handleStationSelect(station)}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{getCountryFlag(station.country)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {station.name}
                  </div>
                  {(station.city && station.city !== station.name) && (
                    <div className="text-sm text-gray-600 truncate">
                      {station.city}, {station.country_name}
                    </div>
                  )}
                  {(!station.city || station.city === station.name) && (
                    <div className="text-sm text-gray-600 truncate">
                      {station.country_name}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 uppercase">
                  {station.station_type}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No Results */}
      {isOpen && !isLoading && stations.length === 0 && value.trim().length >= 2 && (
        <div className={dropdownClasses}>
          <div className="px-4 py-3 text-gray-500 text-center">
            No stations found. Try a different search term.
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search Instructions */}
      {!error && value.length === 0 && (
        <div className="mt-1 text-xs text-gray-500">
          Type at least 2 characters to search European train stations
        </div>
      )}
    </div>
  );
}

export default StationSearch;