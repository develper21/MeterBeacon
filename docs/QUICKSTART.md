# Quick Start Guide ⚡

Get your Smart Meter GPS Tracking System running in 30 minutes!

## 🎯 What You'll Build

A complete IoT tracking system with:
- 📍 Real-time GPS tracking on a web dashboard
- 🔋 Battery monitoring
- 🗺️ Interactive map with live updates
- 📊 Status management (Transit, Storage, Installed)

---

## 📋 Prerequisites

### Software
- [ ] Node.js 18+ installed
- [ ] Arduino IDE installed
- [ ] Supabase account (free)
- [ ] Git installed

### Hardware (for testing)
- [ ] ESP32 board
- [ ] NEO-6M GPS module
- [ ] SIM800L GSM module
- [ ] LiPo battery (3.7V)
- [ ] USB cable
- [ ] Jumper wires

---

## 🚀 Step-by-Step Setup

### Step 1: Clone & Install (5 minutes)

```bash
# Navigate to project
cd /home/narvin/Documents/FullStack/MeterGPSTracking/dashboard

# Dependencies already installed!
# If not, run: npm install

# Create environment file
cp .env.local.example .env.local
```

### Step 2: Setup Supabase (10 minutes)

1. **Create Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `meter-tracking`
   - Choose region: `ap-south-1` (India)
   - Wait 2 minutes

2. **Run Migration**:
   - Open SQL Editor in Supabase
   - Copy from: `supabase/migrations/001_create_trackers_table.sql`
   - Paste and Run

3. **Deploy Edge Function**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Login
   supabase login
   
   # Link project
   supabase link --project-ref your-project-ref
   
   # Deploy
   cd ../supabase/functions
   supabase functions deploy tracker-update
   ```

4. **Get Credentials**:
   - Settings → API
   - Copy Project URL and Anon Key

5. **Update `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   ```

### Step 3: Start Dashboard (2 minutes)

```bash
cd dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the dashboard (empty, no trackers yet).

### Step 4: Test with Dummy Data (3 minutes)

Let's add a test tracker without hardware:

```bash
# Test the API
curl -X POST \
  https://your-project.supabase.co/functions/v1/tracker-update \
  -H "Content-Type: application/json" \
  -H "apikey: your-anon-key" \
  -d '{
    "device_id": "TEST_001",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "battery_level": 85,
    "status": "in_storage"
  }'
```

**Refresh dashboard** - you should see a marker on the map! 🎉

### Step 5: Setup Hardware (10 minutes)

1. **Wire Connections**:
   ```
   ESP32    →    GPS (NEO-6M)
   3.3V     →    VCC
   GND      →    GND
   GPIO16   →    TX
   GPIO17   →    RX
   
   ESP32    →    SIM800L
   VIN      →    VCC (4.2V from battery)
   GND      →    GND
   GPIO26   →    TX
   GPIO27   →    RX
   ```

2. **Upload Firmware**:
   - Open `hardware/esp32_firmware/esp32_tracker.ino` in Arduino IDE
   - Update these lines:
     ```cpp
     #define DEVICE_ID "TRACKER_001"
     #define SUPABASE_URL "https://your-project.supabase.co/functions/v1/tracker-update"
     #define SUPABASE_ANON_KEY "your_anon_key"
     ```
   - Select Board: "ESP32 Dev Module"
   - Select Port
   - Click Upload

3. **Test**:
   - Open Serial Monitor (115200 baud)
   - Wait for GPS fix (1-2 minutes outdoors)
   - Should see: "Data sent successfully!"
   - Check dashboard - new tracker appears!

---

## ✅ Verification Checklist

- [ ] Dashboard loads at localhost:3000
- [ ] Map displays correctly
- [ ] Test tracker appears on map
- [ ] Clicking marker shows popup with details
- [ ] Sidebar shows tracker statistics
- [ ] Real-time updates work (test by sending another API call)
- [ ] Hardware tracker sends data (if connected)

---

## 🎨 Dashboard Features

### Map View
- **Blue markers**: In Transit
- **Green markers**: In Storage
- **Orange markers**: Installed (Off)
- **Gray markers**: Detached
- **Red markers**: Low battery (< 20%)

### Sidebar
- Total trackers count
- Status breakdown
- Low battery alerts
- Clickable tracker list

### Real-time Updates
- Auto-refreshes every 5 minutes
- Instant updates via Supabase Realtime
- No page reload needed

---

## 🧪 Testing Scenarios

### Scenario 1: Warehouse to Site
```bash
# 1. Meter arrives at warehouse
curl -X POST https://your-project.supabase.co/functions/v1/tracker-update \
  -H "Content-Type: application/json" \
  -H "apikey: your-key" \
  -d '{"device_id":"TRACKER_001","latitude":28.6139,"longitude":77.2090,"battery_level":100,"status":"in_storage"}'

# 2. Loaded in truck
curl -X POST https://your-project.supabase.co/functions/v1/tracker-update \
  -H "Content-Type: application/json" \
  -H "apikey: your-key" \
  -d '{"device_id":"TRACKER_001","latitude":28.6200,"longitude":77.2100,"battery_level":95,"status":"in_transit"}'

# 3. Installed at customer site
curl -X POST https://your-project.supabase.co/functions/v1/tracker-update \
  -H "Content-Type: application/json" \
  -H "apikey: your-key" \
  -d '{"device_id":"TRACKER_001","latitude":28.6500,"longitude":77.2500,"battery_level":85,"status":"installed_off","meter_id":"MTR_12345"}'
```

Watch the dashboard update in real-time!

### Scenario 2: Low Battery Alert
```bash
curl -X POST https://your-project.supabase.co/functions/v1/tracker-update \
  -H "Content-Type: application/json" \
  -H "apikey: your-key" \
  -d '{"device_id":"TRACKER_002","latitude":28.6139,"longitude":77.2090,"battery_level":15,"status":"in_transit"}'
```

Marker turns red, appears in "Low Battery" count.

---

## 🐛 Common Issues

### Issue: Dashboard shows "Connection Error"
**Fix**: Check `.env.local` has correct Supabase URL and key

### Issue: Map not loading
**Fix**: Check browser console for errors, ensure Leaflet CSS is loaded

### Issue: No real-time updates
**Fix**: Verify Supabase Realtime is enabled (should be by default)

### Issue: ESP32 not uploading
**Fix**: 
- Check USB cable (use data cable, not charging-only)
- Select correct port in Arduino IDE
- Press BOOT button while uploading

### Issue: GPS not getting fix
**Fix**:
- Go outdoors (GPS doesn't work indoors)
- Wait 2-3 minutes for cold start
- Check GPS antenna connection

### Issue: SIM800L not connecting
**Fix**:
- Verify SIM has active data plan
- Check APN settings match your provider
- Ensure 4.2V power supply (not 3.3V)

---

## 📚 Next Steps

1. **Deploy to Production**:
   - Follow `docs/DEPLOYMENT_GUIDE.md`
   - Deploy dashboard to Vercel
   - Set up monitoring

2. **Build More Trackers**:
   - Follow `docs/HARDWARE_ASSEMBLY.md`
   - Order components in bulk
   - Assemble and test

3. **Customize**:
   - Add more status types
   - Implement geofencing
   - Add SMS alerts
   - Create mobile app

4. **Scale**:
   - Add user authentication
   - Implement role-based access
   - Set up automated reports
   - Integrate with existing systems

---

## 💡 Tips for Success

1. **Start Small**: Test with 2-3 trackers before scaling
2. **Monitor Closely**: Watch dashboard daily for first week
3. **Document Issues**: Keep notes on problems and solutions
4. **Train Staff**: Ensure field team knows how to use system
5. **Iterate**: Gather feedback and improve continuously

---

## 🆘 Need Help?

- **Documentation**: Check `README.md` and `docs/` folder
- **Hardware Issues**: See `docs/HARDWARE_ASSEMBLY.md`
- **Deployment**: See `docs/DEPLOYMENT_GUIDE.md`
- **GitHub Issues**: Create an issue for bugs
- **Email**: support@example.com

---

## 🎉 Congratulations!

You now have a working GPS tracking system! 

**What you've achieved**:
- ✅ Real-time asset tracking
- ✅ Live dashboard with maps
- ✅ Battery monitoring
- ✅ Status management
- ✅ Scalable architecture

**Impact**:
- 🛡️ Prevent asset loss
- 📍 100% visibility of inventory
- ⚡ Faster commissioning
- 💰 ROI in 2-3 months

---

**Ready to deploy? See `docs/DEPLOYMENT_GUIDE.md`**
