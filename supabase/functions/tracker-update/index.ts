import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Parse request body
    const { device_id, latitude, longitude, battery_level, status, meter_id } = await req.json()

    // Validate required fields
    if (!device_id || latitude === undefined || longitude === undefined || battery_level === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: device_id, latitude, longitude, battery_level' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate data types and ranges
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude must be numbers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return new Response(
        JSON.stringify({ error: 'Invalid latitude or longitude values' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (battery_level < 0 || battery_level > 100) {
      return new Response(
        JSON.stringify({ error: 'Battery level must be between 0 and 100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if tracker exists
    const { data: existingTracker } = await supabaseClient
      .from('trackers')
      .select('id')
      .eq('device_id', device_id)
      .single()

    let result

    if (existingTracker) {
      // Update existing tracker
      const updateData: any = {
        latitude,
        longitude,
        battery_level,
        last_updated: new Date().toISOString(),
      }

      if (status) updateData.status = status
      if (meter_id !== undefined) updateData.meter_id = meter_id

      const { data, error } = await supabaseClient
        .from('trackers')
        .update(updateData)
        .eq('device_id', device_id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new tracker
      const { data, error } = await supabaseClient
        .from('trackers')
        .insert({
          device_id,
          latitude,
          longitude,
          battery_level,
          status: status || 'in_storage',
          meter_id: meter_id || null,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
