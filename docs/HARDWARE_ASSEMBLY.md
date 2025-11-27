# Hardware Assembly Guide 🔧

## Bill of Materials (BOM)

### Core Components

| S.No | Component | Specification | Quantity | Price (₹) | Purchase Link |
|------|-----------|---------------|----------|-----------|---------------|
| 1 | ESP32 Dev Board | ESP32-WROOM-32 | 1 | 400 | Amazon/Robu.in |
| 2 | NEO-6M GPS Module | With antenna | 1 | 500 | Amazon/Robu.in |
| 3 | SIM800L GSM Module | Quad-band | 1 | 350 | Amazon/Robu.in |
| 4 | LiPo Battery | 3.7V 2000mAh | 1 | 250 | Amazon |
| 5 | TP4056 Charger | With protection | 1 | 40 | Amazon/Robu.in |
| 6 | Voltage Regulator | AMS1117-3.3V | 1 | 20 | Robu.in |
| 7 | Resistors | 10KΩ (for divider) | 2 | 5 | Local |
| 8 | Capacitors | 100µF, 10µF | 2 | 10 | Local |
| 9 | Jumper Wires | Male-Female | 20 | 50 | Amazon |
| 10 | PCB/Perfboard | 7x5 cm | 1 | 30 | Local |
| 11 | Enclosure Box | Waterproof | 1 | 150 | Amazon |
| 12 | Switch | SPDT | 1 | 10 | Local |
| 13 | LED | Red + Green | 2 | 5 | Local |

**Total Cost: ₹1,820 per tracker**

### Optional Components

| Component | Purpose | Price (₹) |
|-----------|---------|-----------|
| Solar Panel (5V 1W) | Extended battery life | 200 |
| External GPS Antenna | Better signal | 150 |
| Buzzer | Audio alerts | 20 |
| Temperature Sensor | Environment monitoring | 50 |

## Tools Required

- Soldering iron & solder wire
- Wire stripper
- Multimeter
- Hot glue gun
- Screwdriver set
- Drill (for enclosure)

## Step-by-Step Assembly

### Step 1: Power Circuit

```
Battery (3.7V) ──┬──> TP4056 (Charging)
                 │
                 ├──> Switch ──> ESP32 (VIN)
                 │
                 └──> SIM800L (VCC)
```

1. Connect battery to TP4056 input (B+ and B-)
2. Connect TP4056 output to switch
3. Connect switch output to ESP32 VIN pin
4. Add 100µF capacitor between VIN and GND (for stability)

### Step 2: Voltage Divider (Battery Monitor)

```
Battery+ ──┬──> 10KΩ ──┬──> GPIO34 (ESP32)
           │           │
           │          10KΩ
           │           │
GND ───────┴───────────┴──> GND
```

This divider reduces battery voltage (0-4.2V) to safe ADC range (0-2.1V).

### Step 3: GPS Module Connection

```
NEO-6M          ESP32
──────          ─────
VCC      ──>    3.3V
GND      ──>    GND
TX       ──>    GPIO16 (RX2)
RX       ──>    GPIO17 (TX2)
```

**Important**: 
- NEO-6M needs 3.3V (NOT 5V)
- Keep GPS antenna away from metal
- Use external antenna for better signal

### Step 4: SIM800L Connection

```
SIM800L         ESP32/Battery
───────         ─────────────
VCC      ──>    Battery+ (4.2V)
GND      ──>    GND
TX       ──>    GPIO26
RX       ──>    GPIO27
RST      ──>    3.3V (via 10KΩ)
```

**Critical Notes**:
- SIM800L needs 4.2V and can draw 2A during transmission
- Add 470µF capacitor near VCC pin
- Use thick wires for power (22 AWG minimum)
- Never power from ESP32 3.3V pin (insufficient current)

### Step 5: Status LEDs (Optional)

```
GPIO25 ──> 220Ω ──> LED (Green) ──> GND  // GPS Lock
GPIO33 ──> 220Ω ──> LED (Red)   ──> GND  // GSM Status
```

### Step 6: PCB Layout

```
┌─────────────────────────────────┐
│  [TP4056]    [Switch]   [LEDs]  │
│                                  │
│  ┌──────┐    ┌────────┐         │
│  │ GPS  │    │  ESP32 │         │
│  │NEO-6M│    │        │         │
│  └──────┘    └────────┘         │
│                                  │
│  ┌────────┐  [Battery]          │
│  │SIM800L │  [3.7V 2Ah]         │
│  └────────┘                      │
└─────────────────────────────────┘
```

## Wiring Checklist

- [ ] Battery connected to TP4056
- [ ] TP4056 output to switch
- [ ] Switch to ESP32 VIN
- [ ] ESP32 GND to common ground
- [ ] GPS VCC to ESP32 3.3V
- [ ] GPS TX to ESP32 GPIO16
- [ ] GPS RX to ESP32 GPIO17
- [ ] SIM800L VCC to Battery+ (with capacitor)
- [ ] SIM800L TX to ESP32 GPIO26
- [ ] SIM800L RX to ESP32 GPIO27
- [ ] Voltage divider from Battery+ to GPIO34
- [ ] All GND connections to common ground

## Testing Procedure

### 1. Power Test
```bash
# Without SIM/GPS connected
1. Connect battery
2. Turn on switch
3. Check ESP32 power LED
4. Measure voltages:
   - Battery: 3.7-4.2V
   - ESP32 VIN: 3.7-4.2V
   - ESP32 3.3V: 3.3V
```

### 2. GPS Test
```cpp
// Upload this test code
void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
}

void loop() {
  while (Serial2.available()) {
    Serial.write(Serial2.read());
  }
}
```
Expected: NMEA sentences like `$GPGGA,123519,4807.038,N...`

### 3. GSM Test
```cpp
// Upload this test code
void setup() {
  Serial.begin(115200);
  Serial1.begin(9600, SERIAL_8N1, 26, 27);
  delay(3000);
  Serial1.println("AT");
}

void loop() {
  while (Serial1.available()) {
    Serial.write(Serial1.read());
  }
}
```
Expected: `OK` response

### 4. Battery Monitor Test
```cpp
void setup() {
  Serial.begin(115200);
  pinMode(34, INPUT);
}

void loop() {
  int raw = analogRead(34);
  float voltage = (raw / 4095.0) * 3.3 * 2.0;
  Serial.println("Battery: " + String(voltage) + "V");
  delay(1000);
}
```
Expected: 3.7-4.2V reading

## Enclosure Assembly

### 1. Prepare Enclosure
- Drill holes for:
  - USB charging port (TP4056)
  - Power switch
  - Status LEDs
  - GPS antenna (if external)

### 2. Mount Components
```
Top: GPS antenna (clear view of sky)
Middle: ESP32 + SIM800L PCB
Bottom: Battery
Side: Switch, USB port, LEDs
```

### 3. Weatherproofing
- Apply hot glue on all solder joints
- Use silicone sealant around holes
- Ensure USB port has rubber cap
- Test IP rating with water spray (from distance)

### 4. Attachment Method
**Option 1**: Velcro straps (easy removal)
**Option 2**: Cable ties (secure)
**Option 3**: Magnetic mount (quick attach/detach)

## Power Consumption Analysis

| Mode | Current Draw | Duration | Energy |
|------|--------------|----------|--------|
| Deep Sleep | 10mA | 4.5 min | 0.75mAh |
| GPS Active | 50mA | 30 sec | 0.42mAh |
| GSM Transmit | 300mA | 10 sec | 0.83mAh |
| **Per Cycle (5 min)** | | | **2mAh** |

**Battery Life Calculation**:
- Battery: 2000mAh
- Per cycle: 2mAh
- Cycles: 2000/2 = 1000 cycles
- Duration: 1000 × 5 min = **3,500 minutes = 58 hours = 2.4 days**

**To extend battery life**:
- Increase update interval to 10 minutes → 5 days
- Use 5000mAh battery → 6 days (at 5 min interval)
- Add solar panel → Indefinite (in good sunlight)

## Common Issues & Fixes

### Issue 1: ESP32 Not Booting
**Symptoms**: No power LED
**Fix**:
- Check battery voltage (should be > 3.3V)
- Verify switch is ON
- Check TP4056 output with multimeter
- Ensure no short circuits

### Issue 2: GPS Not Getting Fix
**Symptoms**: No NMEA data or invalid coordinates
**Fix**:
- Move to open area (away from buildings)
- Check GPS antenna connection
- Verify 3.3V power to GPS
- Wait 2-3 minutes for cold start
- Try external antenna

### Issue 3: SIM800L Not Responding
**Symptoms**: No "OK" response to AT commands
**Fix**:
- Check 4.2V power supply
- Add 470µF capacitor near VCC
- Verify SIM card is inserted correctly
- Check TX/RX connections (not swapped)
- Ensure SIM has active data plan

### Issue 4: Frequent Resets During GSM Transmission
**Symptoms**: ESP32 resets when sending data
**Fix**:
- Add larger capacitor (1000µF) to SIM800L VCC
- Use separate power supply for SIM800L
- Check battery can provide 2A current
- Use thicker power wires

### Issue 5: Battery Draining Too Fast
**Symptoms**: Battery dies in < 1 day
**Fix**:
- Verify deep sleep is working (check Serial output)
- Increase UPDATE_INTERVAL in code
- Check for power leaks (disconnect modules one by one)
- Use higher capacity battery
- Reduce GPS timeout duration

## Safety Precautions

⚠️ **Important Safety Notes**:

1. **LiPo Battery Safety**:
   - Never short circuit
   - Don't overcharge (> 4.2V)
   - Don't over-discharge (< 3.0V)
   - Keep away from heat/fire
   - Use TP4056 with protection circuit

2. **Soldering Safety**:
   - Work in ventilated area
   - Use lead-free solder
   - Wear safety glasses
   - Don't touch hot iron tip

3. **Electrical Safety**:
   - Disconnect battery before soldering
   - Check polarity before connecting
   - Use multimeter to verify voltages
   - Insulate all exposed connections

4. **Deployment Safety**:
   - Ensure enclosure is waterproof
   - Secure attachment to prevent falling
   - Don't block meter display/buttons
   - Mark as "GPS Tracker" for identification

## Maintenance Schedule

### Weekly
- Check battery level on dashboard
- Verify GPS accuracy
- Monitor signal strength

### Monthly
- Recharge batteries
- Clean GPS antenna
- Check enclosure seals
- Inspect wire connections

### Quarterly
- Replace worn velcro/straps
- Test all trackers
- Update firmware if available
- Calibrate battery readings

## Scaling to Production

For mass production (100+ units):

1. **PCB Design**: Create custom PCB instead of perfboard
2. **SMD Components**: Use surface-mount for smaller size
3. **Automated Assembly**: Consider PCB assembly service
4. **Bulk Purchase**: 30-40% cost reduction
5. **Quality Control**: Test each unit before deployment
6. **Firmware**: Pre-program before assembly
7. **Packaging**: Individual boxes with instructions

**Estimated cost at scale (1000 units)**: ₹1,200-1,400 per tracker

---

**Next Steps**: After assembly, proceed to firmware upload (see main README.md)
