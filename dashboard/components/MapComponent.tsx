'use client'

import { useEffect, useState, useRef } from 'react'
import L from 'leaflet'
import { Tracker } from '@/lib/supabase'

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom marker icons based on status
const createCustomIcon = (status: string, batteryLevel: number) => {
  let color = '#10b981' // green for in_storage
  
  if (status === 'in_transit') color = '#3b82f6' // blue
  else if (status === 'installed_off') color = '#f59e0b' // amber
  else if (status === 'detached') color = '#6b7280' // gray
  
  // Red if battery is low
  if (batteryLevel < 20) color = '#ef4444'
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 12px;
      ">
        ${batteryLevel}%
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

interface MapComponentProps {
  trackers: Tracker[]
}

export default function MapComponent({ trackers }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    setIsMounted(true)
    
    return () => {
      // Cleanup map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!isMounted || !mapRef.current) return

    // Initialize map only if it doesn't exist
    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = [20.5937, 78.9629] // India center
      const defaultZoom = 5

      const map = L.map(mapRef.current).setView(defaultCenter, defaultZoom)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map)

      mapInstanceRef.current = map
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add markers for trackers
    if (trackers.length > 0) {
      const bounds = L.latLngBounds([])
      
      trackers.forEach((tracker) => {
        const marker = L.marker([tracker.latitude, tracker.longitude], {
          icon: createCustomIcon(tracker.status, tracker.battery_level)
        })

        // Create popup content
        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg mb-2">Device: ${tracker.device_id}</h3>
            <div class="space-y-1 text-sm">
              <p><strong>Status:</strong> ${tracker.status.replace('_', ' ').toUpperCase()}</p>
              <p><strong>Battery:</strong> ${tracker.battery_level}%</p>
              ${tracker.meter_id ? `<p><strong>Meter ID:</strong> ${tracker.meter_id}</p>` : ''}
              <p><strong>Location:</strong> ${tracker.latitude.toFixed(6)}, ${tracker.longitude.toFixed(6)}</p>
              <p class="text-gray-500">
                <strong>Last Update:</strong> ${new Date(tracker.last_updated).toLocaleString()}
              </p>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
        marker.addTo(mapInstanceRef.current!)
        markersRef.current.push(marker)
        
        bounds.extend([tracker.latitude, tracker.longitude])
      })

      // Fit map to show all markers
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [isMounted, trackers])

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Initializing map...</p>
      </div>
    )
  }

  return (
    <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
  )
}
