'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Tracker } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'
import { ComponentType } from 'react'

// Dynamically import the entire Map component to avoid SSR issues
const MapComponent = dynamic(
  () => import('./MapComponent') as Promise<{ default: ComponentType<{ trackers: Tracker[] }> }>,
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading map...</span>
      </div>
    )
  }
)

interface MapProps {
  trackers: Tracker[]
}

export default function Map({ trackers }: MapProps) {
  return <MapComponent trackers={trackers} />
}
