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
    // Port V1 scroll detection logic exactly
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isScrollingDown = scrollY > lastScrollY.current;
      const isScrolledPastHero = scrollY > 300;
      
      if (isScrolledPastHero && !isScrollingDown) {
        setIsVisible(true);
      } else if (!isScrolledPastHero || isScrollingDown) {
        setIsVisible(false);
      }
      
      lastScrollY.current = scrollY;
    };
    
    // Port V1 active section detection
    const updateActiveSection = () => {
      const sections = ['hero', 'map', 'community', 'about'];
      const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);
      
      let currentSection = '';
      for (const section of sectionElements) {
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = section.id;
            break;
          }
        }
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
    
    const debouncedHandleScroll = debounce(handleScroll, 100);
    const debouncedUpdateActiveSection = debounce(updateActiveSection, 100);
    
    window.addEventListener('scroll', debouncedHandleScroll);
    window.addEventListener('scroll', debouncedUpdateActiveSection);
    
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      window.removeEventListener('scroll', debouncedUpdateActiveSection);
    };
  }, []);

  const handleNavClick = (href: string) => {
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`floating-nav fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-xl p-2 flex items-center gap-2 z-40 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
    }`}>
      {navItems.map((item) => (
        <button
          key={item.href}
          onClick={() => handleNavClick(item.href)}
          className={`floating-nav__item flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 ${
            activeSection === item.href.substring(1)
              ? 'bg-bot-green text-white shadow-md'
              : 'text-gray-600 hover:bg-bot-green hover:text-white'
          }`}
          title={item.title}
        >
          <span className="floating-nav__icon text-base">{item.icon}</span>
          <span className="floating-nav__label hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}