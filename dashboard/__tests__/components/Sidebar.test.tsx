import { render, screen, fireEvent } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'
import { Tracker, TrackerStatus } from '@/lib/supabase'

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}))

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
  {
    id: '2',
    device_id: 'GPS002',
    latitude: 19.0760,
    longitude: 72.8777,
    battery_level: 15,
    status: 'in_storage' as TrackerStatus,
    meter_id: 'MTR002',
    last_updated: '2024-01-01T11:00:00Z',
    created_at: '2024-01-01T09:00:00Z',
  },
]

describe('Sidebar Component', () => {
  const mockOnSelectTracker = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sidebar with header', () => {
    render(<Sidebar trackers={[]} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('Smart Meter Tracking')).toBeInTheDocument()
    expect(screen.getByText('Real-time asset monitoring')).toBeInTheDocument()
  })

  it('displays correct statistics', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('2')).toBeInTheDocument() // Total trackers
    expect(screen.getByText('1')).toBeInTheDocument() // In transit
    expect(screen.getByText('1')).toBeInTheDocument() // In storage
    expect(screen.getByText('1')).toBeInTheDocument() // Low battery
  })

  it('displays tracker list', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('GPS001')).toBeInTheDocument()
    expect(screen.getByText('GPS002')).toBeInTheDocument()
    expect(screen.getByText('MTR001')).toBeInTheDocument()
    expect(screen.getByText('MTR002')).toBeInTheDocument()
  })

  it('shows empty state when no trackers', () => {
    render(<Sidebar trackers={[]} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('No trackers found')).toBeInTheDocument()
    expect(screen.getByText('Trackers will appear here when they start sending data')).toBeInTheDocument()
  })

  it('calls onSelectTracker when tracker is clicked', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    const trackerButton = screen.getByText('GPS001').closest('button')
    fireEvent.click(trackerButton!)
    
    expect(mockOnSelectTracker).toHaveBeenCalledWith('1')
  })

  it('highlights selected tracker', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker="1" onSelectTracker={mockOnSelectTracker} />)
    
    const selectedButton = screen.getByText('GPS001').closest('button')
    expect(selectedButton).toHaveClass('border-blue-500')
  })

  it('displays battery status correctly', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('shows status labels correctly', () => {
    render(<Sidebar trackers={mockTrackers} selectedTracker={null} onSelectTracker={mockOnSelectTracker} />)
    
    expect(screen.getByText('In Transit')).toBeInTheDocument()
    expect(screen.getByText('In Storage')).toBeInTheDocument()
  })
})
