# Smart Meter GPS Tracking System 🛰️

## Problem

When DISCOM companies purchase millions of smart meters, these meters remain "invisible" before installation. The company doesn't know where their crores of rupees worth of assets are located - which truck, which warehouse, or which site.

**Result**: Asset loss, theft, and commissioning delays.

## Solution

This is a **Real-Time Asset Tracking System** that:
- ✅ Attaches a reusable GPS tracker to every meter
- ✅ Performs live location tracking (updates every 5 minutes)
- ✅ Monitors battery level
- ✅ Tracks status (In-Transit, Storage, Installed)
- ✅ Shows everything real-time on a central dashboard

## Tech Stack

### Hardware (IoT Device)
- **Microcontroller**: ESP32
- **GPS Module**: NEO-6M
- **Cellular Module**: SIM800L / SIM7600E (4G)
- **Power**: LiPo Battery 3.7V (2000mAh)
- **Language**: C++ (Arduino)

### Software (Dashboard)
- **Frontend**: Next.js 15 + TypeScript + TailwindCSS
- **Map**: Leaflet.js
- **Backend**: Supabase (PostgreSQL + PostGIS + Realtime)
- **Edge Functions**: Deno (TypeScript)

## Project Structure

```
MeterGPSTracking/
├── dashboard/              # Next.js Web Dashboard
│   ├── app/               # Next.js App Router
│   ├── components/        # React Components
│   └── lib/               # Utilities & Supabase client
├── hardware/              # ESP32 Firmware
│   └── esp32_firmware/    # Arduino code
├── supabase/              # Supabase Configuration
│   ├── migrations/        # Database schema
│   └── functions/         # Edge Functions
└── docs/                  # Documentation
```

## Features

### 🗺️ Real-Time Map Tracking
- Live location updates every 5 minutes
- Color-coded markers based on status
- Battery level displayed on markers
- Click markers for detailed info

### 📊 Dashboard Statistics
- Total active trackers
- In-Transit count
- In-Storage count
- Low battery alerts

### 🔋 Battery Management
- Real-time battery monitoring
- Low battery alerts (< 20%)
- Optimized deep-sleep mode for power saving

### 📍 Status Management
- **In-Transit**: Meter is in the truck
- **In-Storage**: Stored at warehouse/site
- **Installed (Off)**: Installed at customer's home but not yet activated
- **Detached**: Tracker removed (for reuse)

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the migration to create the database:
   ```bash
   # Copy the SQL from supabase/migrations/001_create_trackers_table.sql
   # Run it in Supabase SQL Editor
   ```

3. Deploy the Edge Function:
   ```bash
   cd supabase/functions
   supabase functions deploy tracker-update
   ```

4. Get your credentials:
   - Project URL: `https://your-project.supabase.co`
   - Anon Key: From Project Settings > API

### 2. Dashboard Setup

1. Navigate to dashboard folder:
   ```bash
   cd dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### 3. Hardware Setup

#### Required Components
| Component | Quantity | Approx Cost (INR) |
|-----------|----------|-------------------|
| ESP32 Dev Board | 1 | ₹300-500 |
| NEO-6M GPS Module | 1 | ₹400-600 |
| SIM800L Module | 1 | ₹300-400 |
| LiPo Battery 3.7V 2000mAh | 1 | ₹200-300 |
| TP4056 Charging Module | 1 | ₹30-50 |
| Jumper Wires | Set | ₹50 |
| PCB/Enclosure | 1 | ₹100-200 |
| **Total per tracker** | | **₹1,400-2,100** |

#### Wiring Diagram

```
ESP32          NEO-6M GPS
3.3V    -----> VCC
GND     -----> GND
GPIO16  -----> TX
GPIO17  -----> RX

ESP32          SIM800L
4.2V    -----> VCC (from battery)
GND     -----> GND
GPIO26  -----> TX
GPIO27  -----> RX

ESP32          Battery Monitor
GPIO34  -----> Battery+ (via 10K+10K voltage divider)
GND     -----> Battery-
```

#### Arduino IDE Setup

1. Install Arduino IDE
2. Add ESP32 board support:
   - File > Preferences
   - Add URL: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools > Board > Boards Manager > Install "ESP32"

3. Install required libraries:
   - TinyGPS++ (by Mikal Hart)
   - HTTPClient (built-in)

4. Open `hardware/esp32_firmware/esp32_tracker.ino`

5. Update configuration:
   ```cpp
   #define DEVICE_ID "TRACKER_001"  // Unique for each device
   #define SUPABASE_URL "https://your-project.supabase.co/functions/v1/tracker-update"
   #define SUPABASE_ANON_KEY "your_key"
   ```

6. Update APN for your SIM provider:
   ```cpp
   // For Jio
   sendATCommand("AT+SAPBR=3,1,\"APN\",\"jionet\"");
   
   // For Airtel
   sendATCommand("AT+SAPBR=3,1,\"APN\",\"airtelgprs.com\"");
   
   // For Vodafone
   sendATCommand("AT+SAPBR=3,1,\"APN\",\"www\"");
   ```

7. Upload to ESP32:
   - Select Board: "ESP32 Dev Module"
   - Select Port
   - Click Upload

## Usage Workflow

### 1. Tracker Deployment
1. Meter arrives at warehouse
2. Attach tracker to meter box
3. Tracker automatically registers with "in_storage" status

### 2. Transit Tracking
1. Meter is loaded into truck
2. Update status on dashboard: "in_transit"
3. Track real-time location

### 3. Installation
1. Meter is installed at customer's home
2. Update status: "installed_off"
3. Assign meter ID

### 4. Commissioning & Reuse
1. When meter is "On" (commissioned)
2. Field engineer detaches tracker
3. Update status: "detached"
4. Send tracker to warehouse
5. Recharge and use on next meter

## API Reference

### Tracker Update Endpoint

**POST** `https://your-project.supabase.co/functions/v1/tracker-update`

**Headers:**
```
Content-Type: application/json
apikey: your_supabase_anon_key
```

**Body:**
```json
{
  "device_id": "TRACKER_001",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "battery_level": 85,
  "status": "in_transit",
  "meter_id": "MTR_12345"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "device_id": "TRACKER_001",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "battery_level": 85,
    "status": "in_transit",
    "meter_id": "MTR_12345",
    "last_updated": "2024-01-01T12:00:00Z"
  }
}
```

## Cost Analysis

### Per Tracker Cost
- Hardware: ₹1,400-2,100 (one-time)
- SIM Card: ₹100-200/month (data plan)
- **Total**: ~₹2,000 initial + ₹150/month operational

### ROI Calculation
- **Without tracking**: 1% asset loss on ₹1 crore inventory = ₹1 lakh loss
- **With tracking**: 100 trackers cost = ₹2 lakhs (one-time) + ₹15k/month
- **Payback period**: 2-3 months
- **Reusability**: Each tracker can be reused 50+ times

## Troubleshooting

### GPS Not Getting Fix
- Ensure GPS antenna has clear sky view
- Wait 2-3 minutes for initial fix (cold start)
- Check GPS module power supply (3.3V)

### GSM Not Connecting
- Check SIM card is active with data plan
- Verify APN settings for your provider
- Check signal strength (AT+CSQ should return > 10)
- Ensure SIM800L has stable 4.2V power

### Dashboard Not Showing Data
- Check Supabase credentials in `.env.local`
- Verify Edge Function is deployed
- Check browser console for errors
- Ensure RLS policies are set correctly

### Battery Draining Fast
- Verify deep sleep is working
- Increase UPDATE_INTERVAL (default 5 min)
- Check for GPS/GSM module power leaks
- Use higher capacity battery (3000mAh+)

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Geofencing alerts
- [ ] Route optimization
- [ ] Historical tracking & analytics
- [ ] Multi-tenant support
- [ ] SMS alerts for critical events
- [ ] Solar charging option
- [ ] Tamper detection
- [ ] OTA firmware updates

## License

MIT License - Free to use for commercial and personal projects

## Support

For issues and questions:
- Create an issue on GitHub
- Email: support@example.com

---

**Made with ❤️ for Indian DISCOM companies**
