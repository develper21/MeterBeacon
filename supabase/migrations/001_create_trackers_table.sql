-- Enable PostGIS extension for geospatial data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create trackers table
CREATE TABLE IF NOT EXISTS trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id VARCHAR(50) UNIQUE NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(POINT, 4326),
  battery_level INTEGER NOT NULL CHECK (battery_level >= 0 AND battery_level <= 100),
  status VARCHAR(20) NOT NULL CHECK (status IN ('in_transit', 'in_storage', 'installed_off', 'detached')),
  meter_id VARCHAR(50),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on device_id for fast lookups
CREATE INDEX idx_trackers_device_id ON trackers(device_id);

-- Create index on status for filtering
CREATE INDEX idx_trackers_status ON trackers(status);

-- Create spatial index on location
CREATE INDEX idx_trackers_location ON trackers USING GIST(location);

-- Create index on last_updated for sorting
CREATE INDEX idx_trackers_last_updated ON trackers(last_updated DESC);

-- Function to automatically update location geography from lat/lon
CREATE OR REPLACE FUNCTION update_tracker_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update location on insert or update
CREATE TRIGGER trigger_update_tracker_location
BEFORE INSERT OR UPDATE ON trackers
FOR EACH ROW
EXECUTE FUNCTION update_tracker_location();

-- Enable Row Level Security (RLS)
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
-- For production, you should create more restrictive policies
CREATE POLICY "Allow all operations for authenticated users"
ON trackers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow read access for anon users (for public dashboard)
CREATE POLICY "Allow read access for anon users"
ON trackers
FOR SELECT
TO anon
USING (true);

-- Create policy to allow insert/update for anon users (for ESP32 devices)
-- In production, you should use service role key or implement device authentication
CREATE POLICY "Allow insert/update for anon users"
ON trackers
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow update for anon users"
ON trackers
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);
