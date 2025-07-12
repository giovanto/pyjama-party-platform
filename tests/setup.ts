import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    form: ({ children, animate, initial, transition, whileHover, whileTap, ...props }: any) => {
      const React = require('react');
      return React.createElement('form', props, children);
    },
    div: ({ children, animate, initial, transition, whileHover, whileTap, ...props }: any) => {
      const React = require('react');
      return React.createElement('div', props, children);
    },
    button: ({ children, animate, initial, transition, whileHover, whileTap, ...props }: any) => {
      const React = require('react');
      return React.createElement('button', props, children);
    },
  },
  AnimatePresence: ({ children }: any) => children,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.refreshDreamMap for testing
const mockRefreshDreamMap = vi.fn();
Object.defineProperty(window, 'refreshDreamMap', {
  writable: true,
  value: mockRefreshDreamMap,
});

// Export for use in tests
export { mockRefreshDreamMap };