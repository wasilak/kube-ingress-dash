import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for components that need it
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    this.callback([{ target: element, contentRect: { width: 0, height: 0 } }]);
  }
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView for elements
Element.prototype.scrollIntoView = jest.fn();

// Mock next/router
jest.mock('next/router', () => require('next-router-mock'));