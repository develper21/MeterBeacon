import { Tracker, TrackerStatus } from '@/lib/supabase'

describe('Supabase Types', () => {
  it('should have correct Tracker interface', () => {
    const tracker: Tracker = {
      id: 'test-id',
      device_id: 'GPS001',
      latitude: 28.6139,
      longitude: 77.2090,
      battery_level: 85,
      status: 'in_transit' as TrackerStatus,
      meter_id: 'MTR001',
      last_updated: '2024-01-01T12:00:00Z',
      created_at: '2024-01-01T10:00:00Z',
    }

    expect(tracker.id).toBe('test-id')
    expect(tracker.device_id).toBe('GPS001')
    expect(tracker.latitude).toBe(28.6139)
    expect(tracker.longitude).toBe(77.2090)
    expect(tracker.battery_level).toBe(85)
    expect(tracker.status).toBe('in_transit')
    expect(tracker.meter_id).toBe('MTR001')
  })

  it('should validate TrackerStatus enum values', () => {
    const validStatuses: TrackerStatus[] = [
      'in_transit',
      'in_storage', 
      'installed_off',
      'detached'
    ]

    validStatuses.forEach(status => {
      expect(status).toBeDefined()
    })
  })
})
