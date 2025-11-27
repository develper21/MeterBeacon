// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Temporary: Commented out Supabase client for UI development
// Uncomment when Supabase URL is available
export const supabase = null

export type TrackerStatus = 'in_transit' | 'in_storage' | 'installed_off' | 'detached'

export interface Tracker {
  id: string
  device_id: string
  latitude: number
  longitude: number
  battery_level: number
  status: TrackerStatus
  meter_id?: string
  last_updated: string
  created_at: string
}

export interface TrackerLocation {
  device_id: string
  latitude: number
  longitude: number
  battery_level: number
  status: TrackerStatus
  meter_id?: string
  timestamp: string
}
