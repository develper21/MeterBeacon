import { render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'

// Mock the dynamic import of Map component
jest.mock('@/components/Map', () => {
  return function MockMap({ trackers }: { trackers: any[] }) {
    return (
      <div data-testid="map-component">
        <div data-testid="tracker-count">{trackers.length}</div>
        {trackers.map(tracker => (
          <div key={tracker.id} data-testid={`tracker-${tracker.device_id}`}>
            {tracker.device_id} - {tracker.battery_level}%
          </div>
        ))}
      </div>
    )
  }
})

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<Home />)
    
    expect(screen.getByText('Loading tracking system...')).toBeInTheDocument()
  })

  it('renders dashboard with mock data', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Smart Meter Tracking Dashboard')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText('Real-time asset monitoring and management')).toBeInTheDocument()
    })
  })

  it('displays statistics cards', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Trackers')).toBeInTheDocument()
      expect(screen.getByText('In Transit')).toBeInTheDocument()
      expect(screen.getByText('Low Battery')).toBeInTheDocument()
      expect(screen.getByText('Avg Battery')).toBeInTheDocument()
    })
  })

  it('shows correct statistics values', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument() // Total trackers
      expect(screen.getByText('1')).toBeInTheDocument() // In transit
      expect(screen.getByText('1')).toBeInTheDocument() // Low battery
      expect(screen.getByText('63%')).toBeInTheDocument() // Avg battery
    })
  })

  it('renders map component', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByTestId('map-component')).toBeInTheDocument()
    })
  })

  it('displays battery status section', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Battery Status')).toBeInTheDocument()
      expect(screen.getByText('GPS001')).toBeInTheDocument()
      expect(screen.getByText('GPS002')).toBeInTheDocument()
      expect(screen.getByText('GPS003')).toBeInTheDocument()
    })
  })

  it('displays recent activity section', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })
  })

  it('shows battery levels correctly', async () => {
    render(<Home />)
    
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('15%')).toBeInTheDocument()
      expect(screen.getByText('92%')).toBeInTheDocument()
    })
  })
})
