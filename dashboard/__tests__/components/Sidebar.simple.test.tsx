import { render, screen } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'
import { Tracker, TrackerStatus } from '@/lib/supabase'

const mockTrackers: Tracker[] = [
  {
    id: '1',
    device_id: 'GPS001',
    latitude: 28.6139,
    longitude: 77.2090,
    battery_level: 85,
    status: 'in_transit' as TrackerStatus,
    meter_id: 'MTR001',
    last_updated: '2024-01-01T12:00:00Z',
    created_at: '2024-01-01T10:00:00Z',
  },
]

describe('Sidebar Component - Simple Tests', () => {
  const mockOnSelectTracker = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sidebar without crashing', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
  })

  it('displays header text', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('Smart Meter Tracking')).toBeInTheDocument()
    expect(screen.getByText('Real-time asset monitoring')).toBeInTheDocument()
  })

  it('displays device ID', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('GPS001')).toBeInTheDocument()
  })

  it('displays battery level', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('displays meter ID when present', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('Meter: MTR001')).toBeInTheDocument()
  })

  it('shows empty state when no trackers', () => {
    render(<Sidebar trackers={[]} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('No trackers found')).toBeInTheDocument()
  })

  it('displays total trackers count', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('Total Trackers')).toBeInTheDocument()
    expect(screen.getAllByText('In Transit')).toHaveLength(2) // One in stats, one in tracker item
  })
})
