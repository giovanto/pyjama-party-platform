/**
 * Footer Component
 * Footer with attribution, links, and project information
 */

import React from 'react';
import type { FooterProps } from '../../types';

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About Pajama Party Platform
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              A whimsical platform connecting dreamers across Europe through train adventures. 
              Share your dream destinations and discover who else is planning magical journeys 
              from your station.
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-2xl">🚂</span>
              <span className="text-2xl">💤</span>
              <span className="text-2xl">✨</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#map" className="hover:text-blue-600 transition-colors">
                  Dream Map
                </a>
              </li>
              <li>
                <a href="#form" className="hover:text-blue-600 transition-colors">
                  Add Your Dream
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-600 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Project Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Project Info
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Event:</span> September 2025 European Pajama Party
              </p>
              <p>
                <span className="font-medium">Privacy:</span> Data auto-deleted after 30 days
              </p>
              <p>
                <span className="font-medium">Open Source:</span> Built with React, TypeScript, Supabase
              </p>
            </div>
            <div className="mt-4">
              <a
                href="https://github.com/pajama-party-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-500">
              © {currentYear} Pajama Party Platform. Built with ❤️ for European dreamers.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Made with</span>
              <div className="flex items-center space-x-2">
                <img
                  src="/vite.svg"
                  alt="Vite"
                  className="w-4 h-4"
                  title="Vite"
                />
                <img
                  src="/src/assets/react.svg"
                  alt="React"
                  className="w-4 h-4"
                  title="React"
                />
                <span className="text-xs">+</span>
                <span className="text-xs font-medium">Supabase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;