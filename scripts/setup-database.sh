#!/bin/bash

# Production Database Setup for DISCOM Smart Meter GPS Tracking
# ============================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="meter_gps_tracking"
DB_USER="discom_admin"
DB_PASSWORD="your_secure_password_here"
DB_HOST="localhost"
DB_PORT="5432"
LOG_FILE="./logs/database-setup.log"

# Create directories if they don't exist
mkdir -p logs

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

# Header
log "🗄️ Setting up Production Database for DISCOM Smart Meter GPS Tracking"
log "================================================================"

# Check prerequisites
check_prerequisites() {
    log "Checking database prerequisites..."
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        error "PostgreSQL is not installed. Please install PostgreSQL 14+"
    fi
    
    # Check PostgreSQL version
    PG_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
    log "PostgreSQL version: $PG_VERSION"
    
    # Check if PostGIS is available
    if ! psql -lqt | grep -q postgis; then
        warning "PostGIS extension not found. Will install during setup."
    fi
    
    success "Database prerequisites check completed"
}

# Create database and user
create_database() {
    log "Creating database and user..."
    
    # Create user if not exists
    sudo -u postgres psql -c "DO \$\$(
        SELECT 'CREATE USER $DB_USER WITH PASSWORD '\''$DB_PASSWORD'\'';'
        WHERE NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER')
    );" || error "Failed to create database user"
    
    # Create database
    sudo -u postgres createdb -O $DB_USER $DB_NAME || error "Failed to create database"
    
    success "Database and user created successfully"
}

# Setup database schema
setup_schema() {
    log "Setting up database schema..."
    
    # Connect to database and run migrations
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
-- Enable PostGIS extension
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trackers_device_id ON trackers(device_id);
CREATE INDEX IF NOT EXISTS idx_trackers_status ON trackers(status);
CREATE INDEX IF NOT EXISTS idx_trackers_location ON trackers USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_trackers_last_updated ON trackers(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_trackers_meter_id ON trackers(meter_id);

-- Function to automatically update location geography from lat/lon
CREATE OR REPLACE FUNCTION update_tracker_location()
RETURNS TRIGGER AS \$\$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  NEW.last_updated = NOW();
  RETURN NEW;
END;
\$\$ LANGUAGE plpgsql;

-- Trigger to update location on insert or update
CREATE TRIGGER trigger_update_tracker_location
BEFORE INSERT OR UPDATE ON trackers
FOR EACH ROW
EXECUTE FUNCTION update_tracker_location();

-- Enable Row Level Security (RLS)
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Allow read access for authenticated users"
ON trackers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow insert/update for authenticated users"
ON trackers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create audit table for tracking changes
CREATE TABLE IF NOT EXISTS tracker_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracker_id UUID REFERENCES trackers(id),
  action VARCHAR(20) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by VARCHAR(100),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for audit table
CREATE INDEX IF NOT EXISTS idx_tracker_audit_tracker_id ON tracker_audit(tracker_id);
CREATE INDEX IF NOT EXISTS idx_tracker_audit_changed_at ON tracker_audit(changed_at DESC);

-- Create trigger function for audit
CREATE OR REPLACE FUNCTION audit_tracker_changes()
RETURNS TRIGGER AS \$\$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO tracker_audit (tracker_id, action, new_data, changed_by)
    VALUES (NEW.id, 'INSERT', row_to_json(NEW), current_user);
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO tracker_audit (tracker_id, action, old_data, new_data, changed_by)
    VALUES (NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_user);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO tracker_audit (tracker_id, action, old_data, changed_by)
    VALUES (OLD.id, 'DELETE', row_to_json(OLD), current_user);
  END IF;
  RETURN NULL;
END;
\$\$ LANGUAGE plpgsql;

-- Create audit trigger
CREATE TRIGGER tracker_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON trackers
FOR EACH ROW
EXECUTE FUNCTION audit_tracker_changes();

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS tracker_analytics AS
SELECT 
  COUNT(*) as total_trackers,
  COUNT(*) FILTER (WHERE status = 'in_transit') as in_transit,
  COUNT(*) FILTER (WHERE status = 'in_storage') as in_storage,
  COUNT(*) FILTER (WHERE status = 'installed_off') as installed_off,
  COUNT(*) FILTER (WHERE status = 'detached') as detached,
  COUNT(*) FILTER (WHERE battery_level < 20) as low_battery,
  ROUND(AVG(battery_level), 2) as avg_battery_level,
  MAX(last_updated) as last_update_time
FROM trackers;

-- Create unique index for materialized view refresh
CREATE UNIQUE INDEX IF NOT EXISTS idx_tracker_analytics_unique ON tracker_analytics ((true));

-- Create function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_tracker_analytics()
RETURNS void AS \$\$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY tracker_analytics;
END;
\$\$ LANGUAGE plpgsql;

-- Create sample data for testing (optional)
INSERT INTO trackers (device_id, latitude, longitude, battery_level, status, meter_id) VALUES
('GPS001', 28.6139, 77.2090, 85, 'in_storage', 'MTR001'),
('GPS002', 19.0760, 72.8777, 15, 'in_transit', 'MTR002'),
('GPS003', 12.9716, 77.5946, 92, 'installed_off', 'MTR003')
ON CONFLICT (device_id) DO NOTHING;

EOF

    if [ $? -eq 0 ]; then
        success "Database schema setup completed"
    else
        error "Database schema setup failed"
    fi
}

# Create monitoring views
create_monitoring_views() {
    log "Creating monitoring views..."
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
-- View for tracker health monitoring
CREATE OR REPLACE VIEW tracker_health AS
SELECT 
  device_id,
  battery_level,
  status,
  last_updated,
  CASE 
    WHEN battery_level < 20 THEN 'CRITICAL'
    WHEN battery_level < 50 THEN 'WARNING'
    ELSE 'HEALTHY'
  END as health_status,
  CASE 
    WHEN last_updated < NOW() - INTERVAL '1 hour' THEN 'OFFLINE'
    WHEN last_updated < NOW() - INTERVAL '30 minutes' THEN 'STALE'
    ELSE 'ONLINE'
  END as connection_status,
  EXTRACT(EPOCH FROM (NOW() - last_updated)) / 60 as minutes_since_update
FROM trackers;

-- View for geographic analysis
CREATE OR REPLACE VIEW tracker_locations AS
SELECT 
  device_id,
  status,
  battery_level,
  ST_X(location::geometry) as longitude,
  ST_Y(location::geometry) as latitude,
  last_updated
FROM trackers
WHERE location IS NOT NULL;

-- View for performance metrics
CREATE OR REPLACE VIEW performance_metrics AS
SELECT 
  COUNT(*) as total_devices,
  COUNT(*) FILTER (WHERE status = 'in_transit') as active_devices,
  ROUND(AVG(battery_level), 2) as avg_battery,
  MIN(battery_level) as min_battery,
  MAX(battery_level) as max_battery,
  COUNT(*) FILTER (WHERE last_updated > NOW() - INTERVAL '1 hour') as recent_updates
FROM trackers;

EOF

    success "Monitoring views created"
}

# Setup backup procedures
setup_backup() {
    log "Setting up backup procedures..."
    
    # Create backup directory
    sudo mkdir -p /var/backups/meter_gps_tracking
    sudo chown postgres:postgres /var/backups/meter_gps_tracking
    
    # Create backup script
    sudo tee /usr/local/bin/backup-meter-gps.sh > /dev/null << 'EOF'
#!/bin/bash
# Backup script for DISCOM Smart Meter GPS Tracking

BACKUP_DIR="/var/backups/meter_gps_tracking"
DB_NAME="meter_gps_tracking"
DATE=\$(date +%Y%m%d_%H%M%S)

# Create database backup
pg_dump -h localhost -U discom_admin -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
EOF

    sudo chmod +x /usr/local/bin/backup-meter-gps.sh
    sudo chown postgres:postgres /usr/local/bin/backup-meter-gps.sh
    
    # Setup cron job for daily backups
    (sudo crontab -u postgres -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-meter-gps.sh") | sudo crontab -u postgres -
    
    success "Backup procedures setup completed"
}

# Create database users for different services
create_service_users() {
    log "Creating service users..."
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << 'EOF'
-- Create read-only user for dashboard
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'dashboard_user') THEN
        CREATE USER dashboard_user WITH PASSWORD 'dashboard_password_here';
    END IF;
END
\$\$;

-- Create read-write user for API services
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'api_user') THEN
        CREATE USER api_user WITH PASSWORD 'api_password_here';
    END IF;
END
\$\$;

-- Grant permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dashboard_user;
GRANT SELECT ON tracker_analytics TO dashboard_user;
GRANT SELECT ON tracker_health TO dashboard_user;
GRANT SELECT ON tracker_locations TO dashboard_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO api_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO api_user;

-- Grant usage on materialized views
GRANT SELECT ON tracker_analytics TO dashboard_user;
GRANT SELECT ON tracker_analytics TO api_user;

EOF

    success "Service users created"
}

# Validate setup
validate_setup() {
    log "Validating database setup..."
    
    # Test database connection
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &>/dev/null; then
        success "Database connection test passed"
    else
        error "Database connection test failed"
    fi
    
    # Test table creation
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM trackers;" &>/dev/null; then
        success "Table creation test passed"
    else
        error "Table creation test failed"
    fi
    
    # Test PostGIS functionality
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM trackers WHERE location IS NOT NULL;" &>/dev/null; then
        success "PostGIS functionality test passed"
    else
        error "PostGIS functionality test failed"
    fi
}

# Main setup function
main() {
    log "Starting production database setup..."
    
    check_prerequisites
    create_database
    setup_schema
    create_monitoring_views
    setup_backup
    create_service_users
    validate_setup
    
    success "🎉 Production database setup completed successfully!"
    log "Database: $DB_NAME"
    log "User: $DB_USER"
    log "Host: $DB_HOST:$DB_PORT"
    log "Backup schedule: Daily at 2:00 AM"
}

# Trap to handle interruption
trap 'error "Database setup interrupted"' INT TERM

# Run main function
main "$@"
