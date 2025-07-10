/**
 * Header Component
 * Main navigation and branding for the Pajama Party Platform
 */

import React from 'react';
import { useStats } from '../../hooks';
import type { HeaderProps } from '../../types';

export function Header({ 
  className = '',
  showStats = true,
  onNavigate,
}: HeaderProps) {
  const { stats, isLoading: statsLoading } = useStats();

  const handleNavigation = (section: string) => {
    onNavigate?.(section);
  };

  return (
    <header className={`header bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl mr-2">🚂</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Pajama Party Platform
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  European Train Adventure Dreams
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          {showStats && (
            <div className="hidden md:flex items-center space-x-6">
              {statsLoading ? (
                <div className="flex items-center space-x-4">
                  <div className="animate-pulse">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ) : stats ? (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.total_dreams}
                    </div>
                    <div className="text-xs text-gray-500">Dreams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.active_stations}
                    </div>
                    <div className="text-xs text-gray-500">Stations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats.communities_forming}
                    </div>
                    <div className="text-xs text-gray-500">Communities</div>
                  </div>
                </>
              ) : (
                <div className="text-gray-500 text-sm">Stats unavailable</div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleNavigation('map')}
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Map
            </button>
            <button
              onClick={() => handleNavigation('form')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Add Dream
            </button>
          </div>
        </div>

        {/* Mobile Stats */}
        {showStats && (
          <div className="md:hidden pb-4">
            {statsLoading ? (
              <div className="flex justify-center space-x-8">
                <div className="animate-pulse">
                  <div className="h-4 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ) : stats ? (
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {stats.total_dreams}
                  </div>
                  <div className="text-xs text-gray-500">Dreams</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">
                    {stats.active_stations}
                  </div>
                  <div className="text-xs text-gray-500">Stations</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-purple-600">
                    {stats.communities_forming}
                  </div>
                  <div className="text-xs text-gray-500">Communities</div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;