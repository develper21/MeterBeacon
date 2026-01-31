import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Initialize Supabase client for API routes
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    logger.info('GET /api/trackers - Fetching all trackers')
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('trackers')
      .select('*')
      .order('last_updated', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: trackers, error, count } = await query

    if (error) {
      logger.error('Database error fetching trackers: ' + error.message)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to fetch trackers' } },
        { status: 500 }
      )
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('trackers')
      .select('*', { count: 'exact', head: true })

    logger.info('Trackers fetched successfully: ' + JSON.stringify({
      count: trackers?.length,
      total: totalCount,
      status,
      limit,
      offset
    }))

    return NextResponse.json({
      data: trackers || [],
      total: totalCount || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (totalCount || 0)
    })

  } catch (error) {
    logger.error('Unexpected error in GET /api/trackers: ' + String(error))
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.info('POST /api/trackers - Creating new tracker')
    
    const body = await request.json()
    const { device_id, latitude, longitude, battery_level, status, meter_id } = body

    // Validate required fields
    if (!device_id || latitude === undefined || longitude === undefined || battery_level === undefined) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Missing required fields: device_id, latitude, longitude, battery_level' 
          } 
        },
        { status: 400 }
      )
    }

    // Validate data ranges
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Latitude and longitude must be numbers' 
          } 
        },
        { status: 400 }
      )
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Invalid latitude or longitude values' 
          } 
        },
        { status: 400 }
      )
    }

    if (battery_level < 0 || battery_level > 100) {
      return NextResponse.json(
        { 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Battery level must be between 0 and 100' 
          } 
        },
        { status: 400 }
      )
    }

    // Check if tracker already exists
    const { data: existingTracker } = await supabase
      .from('trackers')
      .select('id')
      .eq('device_id', device_id)
      .single()

    if (existingTracker) {
      return NextResponse.json(
        { 
          error: { 
            code: 'DUPLICATE_ERROR', 
            message: 'Tracker with this device ID already exists' 
          } 
        },
        { status: 409 }
      )
    }

    // Create new tracker
    const { data: tracker, error } = await supabase
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

    if (error) {
      logger.error('Database error creating tracker: ' + error.message)
      return NextResponse.json(
        { error: { code: 'DATABASE_ERROR', message: 'Failed to create tracker' } },
        { status: 500 }
      )
    }

    logger.info('Tracker created successfully: ' + JSON.stringify({
      trackerId: tracker.id,
      deviceId: device_id
    }))

    return NextResponse.json({
      success: true,
      data: tracker
    }, { status: 201 })

  } catch (error) {
    logger.error('Unexpected error in POST /api/trackers: ' + String(error))
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
