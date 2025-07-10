'use client';

import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  showFloatingNav?: boolean;
}

export function Header({ showFloatingNav }: HeaderProps) {
  return (
    <header className="header bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="header__container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="header__logo">
            <Image 
              src="/assets/bot-logo.svg" 
              alt="Back-on-Track" 
              width={120} 
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>
          <nav className="header__nav hidden md:flex space-x-8">
            <a 
              href="#about" 
              className="header__link text-gray-700 hover:text-bot-green transition-colors duration-150 font-medium"
            >
              About
            </a>
            <a 
              href="#community" 
              className="header__link text-gray-700 hover:text-bot-green transition-colors duration-150 font-medium"
            >
              Community
            </a>
            <a 
              href="https://back-on-track.eu" 
              className="header__link--primary bg-bot-green text-white px-4 py-2 rounded-md font-semibold hover:bg-opacity-90 hover:-translate-y-0.5 transition-all duration-150 shadow-md hover:shadow-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Back-on-Track
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}