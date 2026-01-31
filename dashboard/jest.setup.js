import '@testing-library/jest-dom'

// Mock Leaflet for testing
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

// Mock React-Leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  useMap: () => ({
    setView: jest.fn(),
    on: jest.fn(),
  }),
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

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (fn) => {
    const Component = fn()
    Component.__esModule = true
    return Component
  },
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))
