# Deployment Guide 🚀

## Overview

This guide covers deploying the complete Smart Meter GPS Tracking System to production.

## Prerequisites

- Supabase account (free tier works for PoC)
- Vercel account (for dashboard hosting)
- Domain name (optional)
- SIM cards with data plans
- Assembled hardware trackers

---

## Part 1: Supabase Backend Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill details:
   - **Name**: `meter-gps-tracking`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your location (e.g., `ap-south-1` for India)
4. Wait 2-3 minutes for project creation

### Step 2: Run Database Migration

1. Open Supabase Dashboard → SQL Editor
2. Copy contents from `supabase/migrations/001_create_trackers_table.sql`
3. Paste and click "Run"
4. Verify table created: Go to Table Editor → Should see `trackers` table

### Step 3: Enable PostGIS Extension

1. Go to Database → Extensions
2. Search for "postgis"
3. Click "Enable"
4. Verify: Should show as enabled

### Step 4: Configure Row Level Security (RLS)

The migration already sets up RLS policies, but verify:

1. Go to Authentication → Policies
2. Check `trackers` table has policies:
   - ✅ Allow all for authenticated users
   - ✅ Allow read for anon users
   - ✅ Allow insert/update for anon users

**Production Note**: For production, create more restrictive policies and use service role keys for ESP32 devices.

### Step 5: Deploy Edge Function

#### Option A: Using Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy function
supabase functions deploy tracker-update

# Test function
curl -X POST \
  https://your-project.supabase.co/functions/v1/tracker-update \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -d '{
    "device_id": "TEST_001",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "battery_level": 100,
    "status": "in_storage"
  }'
```

#### Option B: Manual Deployment via Dashboard

1. Go to Edge Functions → Create Function
2. Name: `tracker-update`
3. Copy code from `supabase/functions/tracker-update/index.ts`
4. Click "Deploy"

### Step 6: Get API Credentials

1. Go to Settings → API
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon (public) key**: `eyJhbGc...`
   - **Service Role key**: `eyJhbGc...` (keep secret!)

---

## Part 2: Dashboard Deployment

### Option A: Deploy to Vercel (Recommended)

1. **Push code to GitHub**:
   ```bash
   cd dashboard
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/meter-gps-dashboard.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js
     - **Root Directory**: `dashboard`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Click "Deploy"

5. Your dashboard will be live at: `https://your-project.vercel.app`

### Option B: Deploy to Custom Server

```bash
# Build for production
cd dashboard
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "meter-dashboard" -- start
pm2 save
pm2 startup
```

### Option C: Deploy with Docker

```dockerfile
# Create Dockerfile in dashboard folder
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t meter-dashboard .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  meter-dashboard
```

---

## Part 3: Hardware Deployment

### Step 1: Prepare Trackers

For each tracker:

1. **Flash Firmware**:
   ```cpp
   // Update in esp32_tracker.ino
   #define DEVICE_ID "TRACKER_001"  // Unique ID
   #define SUPABASE_URL "https://your-project.supabase.co/functions/v1/tracker-update"
   #define SUPABASE_ANON_KEY "your_anon_key"
   ```

2. **Set APN** (based on SIM provider):
   ```cpp
   // Jio
   sendATCommand("AT+SAPBR=3,1,\"APN\",\"jionet\"");
   
   // Airtel
   sendATCommand("AT+SAPBR=3,1,\"APN\",\"airtelgprs.com\"");
   ```

3. **Upload Firmware**:
   - Connect ESP32 via USB
   - Select Board: ESP32 Dev Module
   - Select Port
   - Click Upload

4. **Test**:
   - Open Serial Monitor (115200 baud)
   - Should see GPS fix and data transmission logs
   - Check dashboard for new tracker

### Step 2: Label Trackers

Create labels for each tracker:
```
┌─────────────────────────┐
│  GPS TRACKER            │
│  ID: TRACKER_001        │
│  Company: [Your Name]   │
│  Contact: [Phone]       │
│  DO NOT REMOVE          │
└─────────────────────────┘
```

### Step 3: Create Tracker Inventory

Maintain a spreadsheet:

| Device ID | SIM Number | IMEI | Status | Assigned To | Last Seen |
|-----------|------------|------|--------|-------------|-----------|
| TRACKER_001 | 9876543210 | 123... | Active | Warehouse A | 2024-01-01 |
| TRACKER_002 | 9876543211 | 124... | Active | Truck-501 | 2024-01-01 |

### Step 4: SIM Card Setup

For each SIM:

1. **Activate Data Plan**:
   - Minimum: 100MB/month per tracker
   - Recommended: 500MB/month (for safety)

2. **Disable Voice/SMS** (optional, to reduce costs)

3. **Test Connectivity**:
   ```bash
   # Insert SIM in phone
   # Enable data
   # Browse internet to verify
   ```

4. **Note Details**:
   - SIM Number
   - IMEI (if applicable)
   - Data plan expiry
   - Monthly cost

---

## Part 4: Field Deployment Workflow

### Warehouse Setup

1. **Receiving Meters**:
   ```
   New meters arrive → Scan/log → Attach tracker → Update status: "in_storage"
   ```

2. **Dashboard Actions**:
   - Open dashboard
   - Verify tracker appears on map
   - Check battery level
   - Assign meter ID (optional)

### Transit Tracking

1. **Loading Truck**:
   ```
   Select meters → Load in truck → Update status: "in_transit"
   ```

2. **Monitor in Real-Time**:
   - Track truck location on map
   - Verify route
   - Check ETA
   - Monitor battery levels

### Installation

1. **At Customer Site**:
   ```
   Install meter → Update status: "installed_off" → Assign meter ID
   ```

2. **Dashboard Update**:
   - Click tracker on map
   - Change status to "installed_off"
   - Enter meter ID (e.g., MTR_12345)
   - Add notes (customer name, address)

### Commissioning & Reuse

1. **After Meter Goes Live**:
   ```
   Meter commissioned → Detach tracker → Update status: "detached"
   ```

2. **Return to Warehouse**:
   ```
   Recharge tracker → Test → Ready for next meter
   ```

---

## Part 5: Monitoring & Maintenance

### Daily Checks

- [ ] All trackers reporting (check dashboard)
- [ ] No low battery alerts
- [ ] GPS accuracy within acceptable range
- [ ] No stuck/offline trackers

### Weekly Tasks

- [ ] Review tracker utilization
- [ ] Check SIM data usage
- [ ] Recharge returned trackers
- [ ] Update firmware if needed

### Monthly Tasks

- [ ] Analyze tracking data
- [ ] Generate reports (asset movement, losses prevented)
- [ ] Review costs (SIM, maintenance)
- [ ] Plan for scaling

### Alerts Setup

Configure alerts for:

1. **Low Battery** (< 20%):
   ```sql
   -- Create Supabase function to send email/SMS
   CREATE OR REPLACE FUNCTION notify_low_battery()
   RETURNS TRIGGER AS $$
   BEGIN
     IF NEW.battery_level < 20 THEN
       -- Send notification
       PERFORM net.http_post(
         url := 'https://your-alert-service.com/notify',
         body := json_build_object('device_id', NEW.device_id, 'battery', NEW.battery_level)
       );
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;
   ```

2. **Tracker Offline** (no update > 1 hour)
3. **Geofence Breach** (tracker outside expected area)
4. **Tamper Detection** (sudden location change)

---

## Part 6: Scaling to Production

### For 100+ Trackers

1. **Database Optimization**:
   ```sql
   -- Add partitioning for large datasets
   CREATE TABLE trackers_history (
     LIKE trackers INCLUDING ALL
   ) PARTITION BY RANGE (last_updated);
   
   -- Create monthly partitions
   CREATE TABLE trackers_history_2024_01 
   PARTITION OF trackers_history
   FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
   ```

2. **CDN for Dashboard**:
   - Use Vercel Edge Network (automatic)
   - Or CloudFlare for custom domains

3. **Load Balancing**:
   - Supabase handles this automatically
   - For custom backend, use Nginx/HAProxy

4. **Monitoring**:
   - Set up Sentry for error tracking
   - Use Supabase Dashboard for DB metrics
   - Monitor API rate limits

### Cost Optimization

**At 100 trackers**:
- Supabase: Free tier (up to 500MB DB, 2GB bandwidth)
- Vercel: Free tier (100GB bandwidth)
- SIM Cards: ₹100-150/month × 100 = ₹10,000-15,000/month

**At 1000 trackers**:
- Supabase Pro: $25/month (8GB DB, 50GB bandwidth)
- Vercel Pro: $20/month (1TB bandwidth)
- SIM Cards: ₹1,00,000-1,50,000/month
- **Total**: ~₹1,55,000/month

**Cost Reduction Tips**:
- Negotiate bulk SIM rates (can get 30-40% discount)
- Increase update interval (5 min → 10 min = 50% data savings)
- Use data compression for API calls
- Implement smart wake-up (only when moving)

---

## Part 7: Security Best Practices

### API Security

1. **Use Service Role Key for ESP32** (not anon key):
   ```cpp
   // In production
   #define SUPABASE_SERVICE_KEY "your_service_role_key"
   ```

2. **Implement Device Authentication**:
   ```sql
   -- Create devices table
   CREATE TABLE devices (
     device_id VARCHAR(50) PRIMARY KEY,
     api_key VARCHAR(100) UNIQUE,
     is_active BOOLEAN DEFAULT true
   );
   
   -- Validate in Edge Function
   const { device_id, api_key } = await req.json();
   const { data } = await supabase
     .from('devices')
     .select('is_active')
     .eq('device_id', device_id)
     .eq('api_key', api_key)
     .single();
   
   if (!data?.is_active) {
     return new Response('Unauthorized', { status: 401 });
   }
   ```

3. **Rate Limiting**:
   ```typescript
   // In Edge Function
   const rateLimitKey = `ratelimit:${device_id}`;
   const count = await redis.incr(rateLimitKey);
   if (count > 20) { // 20 requests per hour
     return new Response('Rate limit exceeded', { status: 429 });
   }
   await redis.expire(rateLimitKey, 3600);
   ```

### Dashboard Security

1. **Add Authentication**:
   ```typescript
   // Use Supabase Auth
   import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
   
   export default async function DashboardPage() {
     const supabase = createServerComponentClient({ cookies });
     const { data: { session } } = await supabase.auth.getSession();
     
     if (!session) {
       redirect('/login');
     }
     
     // ... rest of component
   }
   ```

2. **Role-Based Access**:
   ```sql
   -- Create roles table
   CREATE TABLE user_roles (
     user_id UUID REFERENCES auth.users,
     role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'viewer'))
   );
   
   -- Update RLS policies
   CREATE POLICY "Managers can update trackers"
   ON trackers FOR UPDATE
   TO authenticated
   USING (
     EXISTS (
       SELECT 1 FROM user_roles
       WHERE user_id = auth.uid()
       AND role IN ('admin', 'manager')
     )
   );
   ```

### Data Security

1. **Encrypt Sensitive Data**:
   ```sql
   -- Enable pgcrypto
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   
   -- Encrypt meter IDs
   ALTER TABLE trackers 
   ADD COLUMN meter_id_encrypted BYTEA;
   ```

2. **Audit Logging**:
   ```sql
   CREATE TABLE audit_log (
     id SERIAL PRIMARY KEY,
     user_id UUID,
     action VARCHAR(50),
     table_name VARCHAR(50),
     record_id UUID,
     changes JSONB,
     timestamp TIMESTAMP DEFAULT NOW()
   );
   ```

---

## Part 8: Troubleshooting Production Issues

### Issue: Trackers Not Reporting

**Diagnosis**:
```sql
-- Find offline trackers
SELECT device_id, last_updated,
       NOW() - last_updated AS offline_duration
FROM trackers
WHERE last_updated < NOW() - INTERVAL '1 hour'
ORDER BY last_updated;
```

**Solutions**:
- Check SIM data balance
- Verify GPS signal (might be indoors)
- Check battery level
- Restart tracker remotely (if OTA enabled)

### Issue: High Data Usage

**Diagnosis**:
```sql
-- Check update frequency
SELECT device_id, 
       COUNT(*) as updates_per_day,
       AVG(EXTRACT(EPOCH FROM (last_updated - LAG(last_updated) OVER (PARTITION BY device_id ORDER BY last_updated)))) as avg_interval_seconds
FROM trackers
WHERE last_updated > NOW() - INTERVAL '1 day'
GROUP BY device_id;
```

**Solutions**:
- Increase update interval
- Implement smart updates (only when moving)
- Compress JSON payload

### Issue: Dashboard Slow

**Solutions**:
- Add database indexes
- Implement pagination
- Use CDN for static assets
- Enable Supabase connection pooling

---

## Part 9: Backup & Disaster Recovery

### Database Backup

```bash
# Automated daily backups (Supabase Pro)
# Or manual backup:
pg_dump -h db.xxxxx.supabase.co \
        -U postgres \
        -d postgres \
        -t trackers \
        > backup_$(date +%Y%m%d).sql
```

### Restore Procedure

```bash
psql -h db.xxxxx.supabase.co \
     -U postgres \
     -d postgres \
     < backup_20240101.sql
```

### Disaster Recovery Plan

1. **Database Failure**: Restore from latest backup (< 24h data loss)
2. **Dashboard Failure**: Redeploy from GitHub (< 5 min downtime)
3. **Supabase Outage**: Implement fallback HTTP endpoint
4. **Complete Failure**: Restore from backups + redeploy (< 1 hour)

---

## Deployment Checklist

### Pre-Deployment
- [ ] Supabase project created
- [ ] Database migrated
- [ ] Edge function deployed
- [ ] Dashboard built and tested locally
- [ ] Hardware assembled and tested
- [ ] SIM cards activated
- [ ] Documentation reviewed

### Deployment
- [ ] Dashboard deployed to Vercel
- [ ] Environment variables configured
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Custom domain configured (optional)
- [ ] Firmware uploaded to all trackers
- [ ] Initial test with 2-3 trackers

### Post-Deployment
- [ ] Monitor for 24 hours
- [ ] Verify all trackers reporting
- [ ] Check dashboard performance
- [ ] Set up alerts
- [ ] Train field staff
- [ ] Document any issues

### Go-Live
- [ ] Deploy remaining trackers
- [ ] Announce to team
- [ ] Provide training
- [ ] Set up support channel
- [ ] Monitor closely for first week

---

**Deployment Complete! 🎉**

Your Smart Meter GPS Tracking System is now live and ready to prevent asset losses!
