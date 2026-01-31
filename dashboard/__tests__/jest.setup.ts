import '@testing-library/jest-dom'
import React from 'react'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn(),
        })),
      })),
    })),
  },
  TrackerStatus: {
    IN_TRANSIT: 'in_transit',
    IN_STORAGE: 'in_storage',
    INSTALLED_OFF: 'installed_off',
    DETACHED: 'detached',
  },
}))

// Mock Leaflet and React-Leaflet
jest.mock('leaflet', () => ({
  map: jest.fn(() => ({
    setView: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
  })),
  icon: jest.fn(),
}))

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => 
    React.createElement('div', { 'data-testid': 'map-container' }, children),
  TileLayer: () => React.createElement('div', { 'data-testid': 'tile-layer' }),
  Marker: ({ children }: { children: React.ReactNode }) => 
    React.createElement('div', { 'data-testid': 'marker' }, children),
  Popup: ({ children }: { children: React.ReactNode }) => 
    React.createElement('div', { 'data-testid': 'popup' }, children),
  useMap: () => ({
    setView: jest.fn(),
    on: jest.fn(),
  }),
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn: any) => {
    const Component = fn()
    Component.__esModule = true
    return Component
  },
}))

// Global test setup
beforeAll(() => {
  global.IntersectionObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: jest.fn(() => []),
  })) as any

  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })) as any
})

// Mock console methods in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
} as any
