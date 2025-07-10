/**
 * FloatingNav Component
 * Floating navigation with scroll-based activation and active section highlighting
 */

import React, { useState, useEffect } from 'react';

export interface FloatingNavItem {
  id: string;
  href: string;
  icon: string;
  label: string;
  title: string;
}

export interface FloatingNavProps {
  className?: string;
  items?: FloatingNavItem[];
  onNavigate?: (section: string) => void;
}

const defaultItems: FloatingNavItem[] = [
  {
    id: 'hero',
    href: '#hero',
    icon: '🌙',
    label: 'Dream',
    title: 'Dream Form'
  },
  {
    id: 'map',
    href: '#map',
    icon: '🗺️',
    label: 'Map',
    title: 'Map'
  },
  {
    id: 'community',
    href: '#community',
    icon: '👥',
    label: 'Community',
    title: 'Community'
  },
  {
    id: 'about',
    href: '#about',
    icon: 'ℹ️',
    label: 'About',
    title: 'About'
  }
];

export function FloatingNav({ 
  className = '',
  items = defaultItems,
  onNavigate 
}: FloatingNavProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingDown = currentScrollY > lastScrollY;
      const isScrolledPastHero = currentScrollY > 300;

      // Show/hide floating nav based on scroll position and direction
      if (isScrolledPastHero && !isScrollingDown) {
        setIsVisible(true);
      } else if (!isScrolledPastHero || isScrollingDown) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);

      // Update active section
      updateActiveSection();
    };

    const updateActiveSection = () => {
      const sections = items.map(item => item.id);
      let active = '';
      
      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            active = sectionId;
          }
        }
      });

      setActiveSection(active);
    };

    // Debounce scroll events
    let timeoutId: NodeJS.Timeout;
    const debouncedHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', debouncedHandleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY, items]);

  const handleItemClick = (item: FloatingNavItem, e: React.MouseEvent) => {
    e.preventDefault();
    
    if (onNavigate) {
      onNavigate(item.id);
    } else {
      // Scroll to section
      const target = document.querySelector(item.href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <nav className={`floating-nav ${className}`}>
      <div className="floating-nav__container">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => handleItemClick(item, e)}
            className={`floating-nav__item ${activeSection === item.id ? 'active' : ''}`}
            title={item.title}
          >
            <span className="floating-nav__icon">{item.icon}</span>
            <span className="floating-nav__label">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

export default FloatingNav;