# System Architecture 🏗️

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     SMART METER TRACKING SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   HARDWARE   │────────▶│   BACKEND    │────────▶│   FRONTEND   │
│  (IoT Device)│  HTTPS  │  (Supabase)  │ Realtime│  (Dashboard) │
└──────────────┘         └──────────────┘         └──────────────┘
      │                         │                         │
      │                         │                         │
   GPS + GSM              PostgreSQL +              Next.js +
   ESP32 + SIM            Edge Functions            Leaflet.js
```

---

## Component Architecture

### 1. Hardware Layer (IoT Device)

```
┌─────────────────────────────────────────────────────┐
│                   ESP32 Tracker                      │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │   GPS    │  │   GSM    │  │ Battery  │         │
│  │ NEO-6M   │  │ SIM800L  │  │  Monitor │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │             │              │                │
│       └─────────────┴──────────────┘                │
│                     │                                │
│              ┌──────▼──────┐                        │
│              │    ESP32    │                        │
│              │ Microcontroller│                     │
│              └──────┬──────┘                        │
│                     │                                │
│              ┌──────▼──────┐                        │
│              │  Deep Sleep │                        │
│              │   Manager   │                        │
│              └─────────────┘                        │
└─────────────────────────────────────────────────────┘
```

**Responsibilities**:
- Read GPS coordinates every 5 minutes
- Monitor battery voltage via ADC
- Connect to cellular network (GPRS)
- Send data to backend via HTTPS POST
- Enter deep sleep to conserve battery

**Data Flow**:
```
GPS → Parse NMEA → Extract Lat/Lon → 
Battery ADC → Calculate % → 
GSM → Connect GPRS → 
HTTP POST → Edge Function → 
Deep Sleep (5 min)
```

---

### 2. Backend Layer (Supabase)

```
┌─────────────────────────────────────────────────────┐
│                    SUPABASE                          │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Edge Function (Deno)                │    │
│  │                                              │    │
│  │  POST /tracker-update                       │    │
│  │  ├─ Validate request                        │    │
│  │  ├─ Check device exists                     │    │
│  │  ├─ Insert/Update tracker                   │    │
│  │  └─ Return response                         │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │      PostgreSQL + PostGIS                    │    │
│  │                                              │    │
│  │  Table: trackers                             │    │
│  │  ├─ id (UUID)                                │    │
│  │  ├─ device_id (VARCHAR)                      │    │
│  │  ├─ latitude (DOUBLE)                        │    │
│  │  ├─ longitude (DOUBLE)                       │    │
│  │  ├─ location (GEOGRAPHY)                     │    │
│  │  ├─ battery_level (INT)                      │    │
│  │  ├─ status (VARCHAR)                         │    │
│  │  ├─ meter_id (VARCHAR)                       │    │
│  │  ├─ last_updated (TIMESTAMP)                 │    │
│  │  └─ created_at (TIMESTAMP)                   │    │
│  │                                              │    │
│  │  Indexes:                                    │    │
│  │  ├─ device_id (B-tree)                       │    │
│  │  ├─ status (B-tree)                          │    │
│  │  ├─ location (GiST)                          │    │
│  │  └─ last_updated (B-tree DESC)               │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │         Realtime (WebSocket)                 │    │
│  │                                              │    │
│  │  Broadcasts changes to subscribed clients    │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Responsibilities**:
- Receive tracker data via Edge Function
- Validate and sanitize input
- Store in PostgreSQL with PostGIS
- Broadcast updates via Realtime
- Enforce Row Level Security (RLS)

**API Endpoints**:
```
POST /functions/v1/tracker-update
  - Insert or update tracker location
  - Returns: { success, data }

WebSocket /realtime/v1
  - Subscribe to tracker updates
  - Receives: INSERT, UPDATE, DELETE events
```

---

### 3. Frontend Layer (Dashboard)

```
┌─────────────────────────────────────────────────────┐
│                  NEXT.JS DASHBOARD                   │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │            App Router (RSC)                 │    │
│  │                                              │    │
│  │  /app/page.tsx (Main Dashboard)             │    │
│  │  ├─ Fetch initial trackers                  │    │
│  │  ├─ Subscribe to realtime updates           │    │
│  │  └─ Render Map + Sidebar                    │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │           Components                         │    │
│  │                                              │    │
│  │  ┌─────────────┐  ┌─────────────┐          │    │
│  │  │   Sidebar   │  │     Map     │          │    │
│  │  │             │  │             │          │    │
│  │  │ - Stats     │  │ - Leaflet   │          │    │
│  │  │ - Filters   │  │ - Markers   │          │    │
│  │  │ - List      │  │ - Popups    │          │    │
│  │  └─────────────┘  └─────────────┘          │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Supabase Client                     │    │
│  │                                              │    │
│  │  - Real-time subscription                   │    │
│  │  - Query trackers                           │    │
│  │  - Handle updates                           │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Responsibilities**:
- Display interactive map with tracker markers
- Show real-time statistics
- Handle user interactions (click, filter)
- Subscribe to database changes
- Update UI without page reload

**State Management**:
```typescript
const [trackers, setTrackers] = useState<Tracker[]>([])
const [selectedTracker, setSelectedTracker] = useState<string | null>(null)

// Initial fetch
useEffect(() => {
  fetchTrackers()
}, [])

// Realtime subscription
useEffect(() => {
  const subscription = supabase
    .channel('tracker_updates')
    .on('postgres_changes', { table: 'trackers' }, () => {
      fetchTrackers() // Refresh data
    })
    .subscribe()
    
  return () => subscription.unsubscribe()
}, [])
```

---

## Data Flow Diagram

### Complete Request Flow

```
┌──────────┐
│  ESP32   │
│ Tracker  │
└────┬─────┘
     │ 1. Wake from sleep
     │
     ▼
┌──────────┐
│   GPS    │ 2. Get location
│  Module  │    (28.6139, 77.2090)
└────┬─────┘
     │
     ▼
┌──────────┐
│ Battery  │ 3. Read voltage
│  Monitor │    (85%)
└────┬─────┘
     │
     ▼
┌──────────┐
│   GSM    │ 4. Connect to network
│  Module  │    (GPRS)
└────┬─────┘
     │
     │ 5. HTTPS POST
     │    {
     │      device_id: "TRACKER_001",
     │      latitude: 28.6139,
     │      longitude: 77.2090,
     │      battery_level: 85,
     │      status: "in_transit"
     │    }
     │
     ▼
┌──────────────────┐
│  Edge Function   │ 6. Validate data
│  (Supabase)      │    Check device_id
└────┬─────────────┘
     │
     │ 7. SQL Query
     │    INSERT/UPDATE trackers
     │
     ▼
┌──────────────────┐
│   PostgreSQL     │ 8. Store data
│   + PostGIS      │    Update location
└────┬─────────────┘
     │
     │ 9. Trigger
     │    Update location geography
     │    Update last_updated timestamp
     │
     ▼
┌──────────────────┐
│    Realtime      │ 10. Broadcast change
│   (WebSocket)    │     to subscribers
└────┬─────────────┘
     │
     │ 11. WebSocket message
     │     { event: 'UPDATE', table: 'trackers', ... }
     │
     ▼
┌──────────────────┐
│   Dashboard      │ 12. Receive update
│   (Next.js)      │     Refresh trackers
└────┬─────────────┘
     │
     │ 13. Re-render
     │     Update map marker
     │     Update sidebar stats
     │
     ▼
┌──────────────────┐
│   User sees      │ 14. Live update!
│   new location   │     No page refresh
└──────────────────┘
```

---

## Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────┐
│                  SECURITY LAYERS                     │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Row Level Security (RLS)            │    │
│  │                                              │    │
│  │  Policy: Allow read for anon users          │    │
│  │  Policy: Allow insert/update for anon       │    │
│  │  Policy: Allow all for authenticated        │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │         API Key Validation                   │    │
│  │                                              │    │
│  │  Edge Function checks apikey header          │    │
│  │  Validates against Supabase anon key         │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │         Input Validation                     │    │
│  │                                              │    │
│  │  - Check required fields                     │    │
│  │  - Validate data types                       │    │
│  │  - Sanitize inputs                           │    │
│  │  - Check ranges (lat, lon, battery)          │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Production Security Enhancements

For production deployment:

1. **Device Authentication**:
   ```sql
   CREATE TABLE devices (
     device_id VARCHAR(50) PRIMARY KEY,
     api_key VARCHAR(100) UNIQUE,
     is_active BOOLEAN DEFAULT true
   );
   ```

2. **Rate Limiting**:
   ```typescript
   // Max 20 requests per hour per device
   const rateLimit = await checkRateLimit(device_id)
   if (rateLimit.exceeded) {
     return new Response('Rate limit exceeded', { status: 429 })
   }
   ```

3. **HTTPS Only**:
   - All communication encrypted
   - Certificate pinning on ESP32

4. **Data Encryption**:
   ```sql
   -- Encrypt sensitive fields
   ALTER TABLE trackers 
   ADD COLUMN meter_id_encrypted BYTEA;
   ```

---

## Scalability Architecture

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────┐
│                  LOAD DISTRIBUTION                   │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Multiple Edge Functions             │    │
│  │                                              │    │
│  │  Function 1 ──┐                             │    │
│  │  Function 2 ──┼──▶ Load Balancer           │    │
│  │  Function 3 ──┘                             │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │      Connection Pooling (PgBouncer)         │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │      Database Read Replicas                  │    │
│  │                                              │    │
│  │  Primary (Write) ──▶ Replica 1 (Read)       │    │
│  │                  └─▶ Replica 2 (Read)       │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Performance Optimization

1. **Database Indexes**:
   ```sql
   -- Spatial index for location queries
   CREATE INDEX idx_trackers_location 
   ON trackers USING GIST(location);
   
   -- Composite index for common queries
   CREATE INDEX idx_trackers_status_updated 
   ON trackers(status, last_updated DESC);
   ```

2. **Caching Strategy**:
   ```typescript
   // Cache tracker list for 30 seconds
   const cachedTrackers = await redis.get('trackers:all')
   if (cachedTrackers) return cachedTrackers
   
   const trackers = await fetchFromDB()
   await redis.setex('trackers:all', 30, trackers)
   ```

3. **Data Partitioning**:
   ```sql
   -- Partition by date for historical data
   CREATE TABLE trackers_history 
   PARTITION BY RANGE (last_updated);
   ```

---

## Monitoring & Observability

### Metrics to Track

```
┌─────────────────────────────────────────────────────┐
│                    MONITORING                        │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Application Metrics                 │    │
│  │                                              │    │
│  │  - Active trackers count                    │    │
│  │  - Update frequency per device              │    │
│  │  - API response time                        │    │
│  │  - Error rate                               │    │
│  │  - Battery levels distribution              │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Infrastructure Metrics              │    │
│  │                                              │    │
│  │  - Database CPU/Memory usage                │    │
│  │  - Connection pool size                     │    │
│  │  - Query performance                        │    │
│  │  - Storage usage                            │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Business Metrics                    │    │
│  │                                              │    │
│  │  - Trackers by status                       │    │
│  │  - Average transit time                     │    │
│  │  - Asset utilization rate                   │    │
│  │  - Commissioning delays                     │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Alerting Rules

```yaml
alerts:
  - name: tracker_offline
    condition: last_updated > 1 hour
    action: send_email
    
  - name: low_battery
    condition: battery_level < 20%
    action: send_sms
    
  - name: high_error_rate
    condition: error_rate > 5%
    action: page_oncall
    
  - name: database_slow
    condition: query_time > 1s
    action: send_slack
```

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────┐
│                  PRODUCTION STACK                    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Frontend (Vercel)                   │    │
│  │                                              │    │
│  │  - Next.js app deployed globally            │    │
│  │  - Edge network (CDN)                       │    │
│  │  - Automatic SSL                            │    │
│  │  - Zero-downtime deployments                │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │         Backend (Supabase)                   │    │
│  │                                              │    │
│  │  - PostgreSQL (managed)                      │    │
│  │  - Edge Functions (Deno)                     │    │
│  │  - Realtime (WebSocket)                      │    │
│  │  - Automatic backups                         │    │
│  │  - Point-in-time recovery                    │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                     │
│  ┌──────────────▼───────────────────────────────┐    │
│  │         Monitoring (Sentry + Supabase)       │    │
│  │                                              │    │
│  │  - Error tracking                            │    │
│  │  - Performance monitoring                    │    │
│  │  - Database metrics                          │    │
│  │  - Uptime monitoring                         │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## Technology Choices & Rationale

| Component | Technology | Why? |
|-----------|-----------|------|
| **Microcontroller** | ESP32 | WiFi + Bluetooth, low power, cheap |
| **GPS** | NEO-6M | Reliable, accurate, affordable |
| **Cellular** | SIM800L | Quad-band, simple AT commands |
| **Database** | PostgreSQL + PostGIS | Geospatial queries, ACID compliance |
| **Backend** | Supabase | Managed PostgreSQL, realtime, edge functions |
| **Frontend** | Next.js | SSR, performance, developer experience |
| **Map** | Leaflet.js | Open source, lightweight, no API limits |
| **Hosting** | Vercel | Zero-config, global CDN, free tier |

---

## Future Architecture Enhancements

### Phase 2: Advanced Features

1. **Geofencing**:
   ```sql
   -- Define geofences
   CREATE TABLE geofences (
     id UUID PRIMARY KEY,
     name VARCHAR(100),
     boundary GEOGRAPHY(POLYGON)
   );
   
   -- Check if tracker is inside geofence
   SELECT * FROM trackers t, geofences g
   WHERE ST_Within(t.location, g.boundary);
   ```

2. **Route Optimization**:
   ```typescript
   // Calculate optimal route for truck
   const route = await calculateRoute(
     start: warehouse,
     stops: [site1, site2, site3],
     end: warehouse
   )
   ```

3. **Predictive Analytics**:
   ```python
   # ML model to predict battery life
   model.predict(
     usage_pattern,
     temperature,
     update_frequency
   ) → estimated_days_remaining
   ```

4. **Mobile App**:
   ```
   React Native App
   ├── Real-time tracking
   ├── Push notifications
   ├── Offline mode
   └── QR code scanning
   ```

---

**This architecture is designed to scale from 10 to 10,000+ trackers with minimal changes!**
