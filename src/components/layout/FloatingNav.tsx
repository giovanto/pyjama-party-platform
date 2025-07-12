'use client';

import { useState, useEffect, useRef } from 'react';

interface FloatingNavItem {
  href: string;
  icon: string;
  label: string;
  title: string;
}

const navItems: FloatingNavItem[] = [
  { href: '#hero', icon: '🌙', label: 'Dream', title: 'Dream Form' },
  { href: '#map', icon: '🗺️', label: 'Map', title: 'Map' },
  { href: '#community', icon: '👥', label: 'Community', title: 'Community' },
  { href: '#about', icon: 'ℹ️', label: 'About', title: 'About' },
];

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Improved scroll detection: show after 200px scroll (faster response)
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isScrolledPast = scrollY > 200;
      
      setIsVisible(isScrolledPast);
      lastScrollY.current = scrollY;
    };
    
    // Enhanced active section detection with better accuracy
    const updateActiveSection = () => {
      const sections = ['hero', 'map', 'community', 'about'];
      const sectionElements = sections
        .map(id => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null);
      
      let currentSection = '';
      const viewportHeight = window.innerHeight;
      const centerPoint = viewportHeight / 2;
      
      for (const section of sectionElements) {
        const rect = section.getBoundingClientRect();
        // Check if section center is in viewport or if section covers the center
        if (rect.top <= centerPoint && rect.bottom >= centerPoint) {
          currentSection = section.id;
          break;
        }
      }
      
      // Fallback to the section closest to viewport center if none found
      if (!currentSection && sectionElements.length > 0) {
        let closestSection = sectionElements[0];
        let closestDistance = Math.abs(closestSection.getBoundingClientRect().top + closestSection.getBoundingClientRect().height / 2 - centerPoint);
        
        for (const section of sectionElements) {
          const rect = section.getBoundingClientRect();
          const sectionCenter = rect.top + rect.height / 2;
          const distance = Math.abs(sectionCenter - centerPoint);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = section;
          }
        }
        currentSection = closestSection.id;
      }
      
      setActiveSection(currentSection);
    };
    
    // Debounce scroll events (same as V1)
    const debounce = (func: (...args: unknown[]) => void, wait: number) => {
      let timeout: NodeJS.Timeout;
      return (...args: unknown[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };
    
    const debouncedHandleScroll = debounce(handleScroll, 50);
    const debouncedUpdateActiveSection = debounce(updateActiveSection, 50);
    
    window.addEventListener('scroll', debouncedHandleScroll);
    window.addEventListener('scroll', debouncedUpdateActiveSection);
    
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      window.removeEventListener('scroll', debouncedUpdateActiveSection);
    };
  }, []);

  const handleNavClick = (href: string) => {
    const target = document.querySelector(href) as HTMLElement | null;
    if (target) {
      // Enhanced smooth scrolling with offset for better positioning
      const targetPosition = target.offsetTop - 80;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className={`floating-nav fixed top-1/2 right-4 sm:right-6 transform -translate-y-1/2 z-40 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'
    }`}>
      <div className="floating-nav__container bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-bot-green/30 p-2 sm:p-3">
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`floating-nav__item flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-base sm:text-lg font-medium transition-all duration-200 hover:scale-110 hover:shadow-xl border-2 focus:outline-none focus:ring-4 focus:ring-bot-green/40 ${
                activeSection === item.href.substring(1)
                  ? 'bg-gradient-to-br from-bot-green to-bot-dark-green text-white shadow-xl transform scale-105 border-bot-light-green'
                  : 'text-bot-dark hover:bg-gradient-to-br hover:from-bot-green hover:to-bot-light-green hover:text-white border-bot-green/30 hover:border-bot-green bg-white'
              }`}
              title={item.title}
              aria-label={`Navigate to ${item.title}`}
            >
              <span className="floating-nav__icon" aria-hidden="true">{item.icon}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}