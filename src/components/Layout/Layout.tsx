/**
 * Layout Component
 * Main layout wrapper with header, main content, and footer
 */

import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import type { LayoutProps } from '../../types';

export function Layout({ 
  children, 
  className = '',
  showHeader = true,
  showFooter = true,
  showStats = true,
  onNavigate,
}: LayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 ${className}`}>
      {/* Header */}
      {showHeader && (
        <Header 
          showStats={showStats}
          onNavigate={onNavigate}
        />
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
}

export default Layout;