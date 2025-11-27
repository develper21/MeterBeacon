'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { supabase, Tracker } from '@/lib/supabase'
import { Loader2, Activity, MapPin, Battery, TrendingUp, AlertCircle, Package, Truck } from 'lucide-react'

// Dynamically import Map component (client-side only)
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  ),
})

// Mock data for UI development
const mockTrackers: Tracker[] = [
  {
    id: '1',
    device_id: 'GPS001',
    latitude: 28.6139,
    longitude: 77.2090,
    battery_level: 85,
    status: 'in_transit',
    meter_id: 'MTR001',
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    device_id: 'GPS002',
    latitude: 19.0760,
    longitude: 72.8777,
    battery_level: 15,
    status: 'in_storage',
    meter_id: 'MTR002',
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    device_id: 'GPS003',
    latitude: 12.9716,
    longitude: 77.5946,
    battery_level: 92,
    status: 'installed_off',
    meter_id: 'MTR003',
    last_updated: new Date().toISOString(),
    created_at: new Date().toISOString()
  }
]

// Progress Ring Component
function ProgressRing({ value, size = 60, strokeWidth = 4, color = 'rgb(59, 130, 246)' }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgb(55, 65, 81)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function Home() {
  const [trackers, setTrackers] = useState<Tracker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Use mock data for now
    setTrackers(mockTrackers)
    setLoading(false)
  }, [])

  const stats = {
    total: trackers.length,
    in_transit: trackers.filter(t => t.status === 'in_transit').length,
    in_storage: trackers.filter(t => t.status === 'in_storage').length,
    installed_off: trackers.filter(t => t.status === 'installed_off').length,
    low_battery: trackers.filter(t => t.battery_level < 20).length,
    avg_battery: trackers.length > 0 ? Math.round(trackers.reduce((acc, t) => acc + t.battery_level, 0) / trackers.length) : 0
  }

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading tracking system...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md p-6 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-100 mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Smart Meter Tracking Dashboard</h1>
        <p className="text-gray-400">Real-time asset monitoring and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{stats.total}</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Total Trackers</h3>
          <p className="text-gray-500 text-xs mt-1">Active devices</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Truck className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{stats.in_transit}</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">In Transit</h3>
          <p className="text-gray-500 text-xs mt-1">Currently moving</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Battery className="w-6 h-6 text-orange-500" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{stats.low_battery}</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Low Battery</h3>
          <p className="text-gray-500 text-xs mt-1">Needs attention</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-pink-500" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{stats.avg_battery}%</span>
          </div>
          <h3 className="text-gray-400 text-sm font-medium">Avg Battery</h3>
          <p className="text-gray-500 text-xs mt-1">System health</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="h-96 lg:h-full min-h-96">
              <Map trackers={trackers} />
          </div>
        </div>

        {/* Status Overview */}
        <div className="space-y-6">
          {/* Battery Status */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Battery Status</h2>
            <div className="space-y-4">
              {trackers.slice(0, 3).map((tracker) => {
                const batteryColor = tracker.battery_level < 20 ? 'rgb(239, 68, 68)' : 
                                  tracker.battery_level < 50 ? 'rgb(251, 146, 60)' : 'rgb(34, 197, 94)'
                return (
                  <div key={tracker.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <ProgressRing value={tracker.battery_level} size={50} color={batteryColor} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-100">
                          {tracker.battery_level}%
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-100">{tracker.device_id}</p>
                        <p className="text-xs text-gray-500">{tracker.status.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <Battery className={`w-5 h-5 ${tracker.battery_level < 20 ? 'text-red-500' : 'text-gray-400'}`} />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {trackers.slice(0, 3).map((tracker) => (
                <div key={tracker.id} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    tracker.status === 'in_transit' ? 'bg-blue-500' :
                    tracker.status === 'in_storage' ? 'bg-green-500' :
                    tracker.status === 'installed_off' ? 'bg-orange-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-100">{tracker.device_id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tracker.last_updated).toLocaleTimeString()}
                    </p>
                  </div>
                  <MapPin className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
