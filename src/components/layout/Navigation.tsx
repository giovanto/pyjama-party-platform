'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Dream', href: '/dream', icon: '🌙' },
  { label: 'Event', href: '/pyjama-party', icon: '🎉' },
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'Community', href: '/community', icon: '👥' },
  { label: 'About', href: '/about', icon: 'ℹ️' }
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image 
                src="/assets/bot-logo.svg" 
                alt="Back-on-Track" 
                width={120} 
                height={40}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-bot-green/10 ${
                    isActive(item.href)
                      ? 'bg-bot-green text-white shadow-md'
                      : 'text-gray-700 hover:text-bot-green'
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex items-center space-x-4">
              <Link
                href="/pyjama-party"
                className="bg-gradient-to-r from-bot-green to-bot-dark-green text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Join Sept 26 Event
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link href="/" className="flex items-center" onClick={closeMobileMenu}>
                <Image 
                  src="/assets/bot-logo.svg" 
                  alt="Back-on-Track" 
                  width={100} 
                  height={32}
                  className="h-6 w-auto"
                  priority
                />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                aria-label="Toggle navigation menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span
                    className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                      mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
                    }`}
                  />
                  <span
                    className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                      mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                      mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeMobileMenu}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />

              {/* Mobile Menu */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 lg:hidden"
              >
                <div className="p-6">
                  {/* Close Button */}
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
                    <button
                      onClick={closeMobileMenu}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      aria-label="Close menu"
                    >
                      <span className="sr-only">Close menu</span>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center space-x-4 p-4 rounded-xl text-lg transition-all duration-200 hover:bg-gray-50 ${
                          isActive(item.href)
                            ? 'bg-bot-green text-white shadow-md'
                            : 'text-gray-700 hover:text-bot-green'
                        }`}
                      >
                        <span className="text-2xl" aria-hidden="true">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                        {isActive(item.href) && (
                          <motion.div
                            layoutId="mobile-active"
                            className="ml-auto w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile CTA */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <Link
                      href="/pyjama-party"
                      onClick={closeMobileMenu}
                      className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-bot-green to-bot-dark-green text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                    >
                      <span className="text-xl">🎉</span>
                      <span>Join September 26 Event</span>
                    </Link>
                  </div>

                  {/* Footer Links */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-500 text-center space-y-2">
                      <div className="flex justify-center space-x-4">
                        <Link href="/privacy" onClick={closeMobileMenu} className="hover:text-bot-green">
                          Privacy
                        </Link>
                        <Link href="/terms" onClick={closeMobileMenu} className="hover:text-bot-green">
                          Terms
                        </Link>
                        <Link href="/data-rights" onClick={closeMobileMenu} className="hover:text-bot-green">
                          Data Rights
                        </Link>
                      </div>
                      <p className="text-xs">Back-on-Track Action Group</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}