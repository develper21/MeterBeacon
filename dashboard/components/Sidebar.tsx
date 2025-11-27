'use client'

import { Tracker, TrackerStatus } from '@/lib/supabase'
import { Battery, MapPin, Package, Truck, Power } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SidebarProps {
  trackers: Tracker[]
  selectedTracker: string | null
  onSelectTracker: (id: string) => void
}

const statusConfig: Record<TrackerStatus, { label: string; icon: any; color: string }> = {
  in_transit: { label: 'In Transit', icon: Truck, color: 'text-blue-600' },
  in_storage: { label: 'In Storage', icon: Package, color: 'text-green-600' },
  installed_off: { label: 'Installed (Off)', icon: Power, color: 'text-amber-600' },
  detached: { label: 'Detached', icon: MapPin, color: 'text-gray-600' },
}

export default function Sidebar({ trackers, selectedTracker, onSelectTracker }: SidebarProps) {
  const stats = {
    total: trackers.length,
    in_transit: trackers.filter(t => t.status === 'in_transit').length,
    in_storage: trackers.filter(t => t.status === 'in_storage').length,
    installed_off: trackers.filter(t => t.status === 'installed_off').length,
    low_battery: trackers.filter(t => t.battery_level < 20).length,
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Smart Meter Tracking</h1>
        <p className="text-sm text-gray-600 mt-1">Real-time asset monitoring</p>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Trackers</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.in_transit}</div>
            <div className="text-xs text-gray-600">In Transit</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.in_storage}</div>
            <div className="text-xs text-gray-600">In Storage</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.low_battery}</div>
            <div className="text-xs text-gray-600">Low Battery</div>
          </div>
        </div>
      </div>

      {/* Tracker List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {trackers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No trackers found</p>
              <p className="text-sm mt-1">Trackers will appear here when they start sending data</p>
            </div>
          ) : (
            trackers.map((tracker) => {
              const config = statusConfig[tracker.status]
              const Icon = config.icon
              const isSelected = selectedTracker === tracker.id
              const isLowBattery = tracker.battery_level < 20

              return (
                <button
                  key={tracker.id}
                  onClick={() => onSelectTracker(tracker.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${config.color}`} />
                      <span className="font-semibold text-sm text-gray-900">
                        {tracker.device_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Battery
                        className={`w-4 h-4 ${
                          isLowBattery ? 'text-red-600' : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          isLowBattery ? 'text-red-600' : 'text-gray-600'
                        }`}
                      >
                        {tracker.battery_level}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${config.color} font-medium`}>
                        {config.label}
                      </span>
                    </div>
                    {tracker.meter_id && (
                      <div className="text-xs text-gray-600">
                        Meter: {tracker.meter_id}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      Updated {formatDistanceToNow(new Date(tracker.last_updated), { addSuffix: true })}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
