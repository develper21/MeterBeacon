import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Radio, 
  ShieldAlert, 
  MapPin, 
  BatteryCharging, 
  CheckCircle2, 
  Truck, 
  Package, 
  Unplug, 
  Wifi, 
  Activity, 
  ArrowRight,
  RefreshCw,
  BellRing
} from "lucide-react";

type DemoState = "in_transit" | "installed" | "storage" | "detached";

interface StateConfig {
  label: string;
  statusText: string;
  statusBadgeColor: string;
  speed: string;
  locationName: string;
  coordinates: string;
  battery: number;
  batteryVoltage: string;
  signalStrength: string;
  tamperState: "ARMED" | "NORMAL" | "TRIGGERED (ALARM)";
  tamperColor: string;
  eventDescription: string;
}

const stateConfigs: Record<DemoState, StateConfig> = {
  in_transit: {
    label: "In Transit",
    statusText: "DISPATCH LOGISTICS",
    statusBadgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    speed: "48.2 km/h",
    locationName: "Highway NH-48 Corridor • Sector 9",
    coordinates: "28.4595° N, 77.0266° E",
    battery: 94,
    batteryVoltage: "3.62V LiSOCl2",
    signalStrength: "-68 dBm (4G LTE-M)",
    tamperState: "ARMED",
    tamperColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    eventDescription: "Meter in authorized route corridor to Northern Substation #14. Heartbeat ping received every 30 seconds."
  },
  installed: {
    label: "Installed & Secure",
    statusText: "OPERATIONAL GRID",
    statusBadgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    speed: "0.0 km/h (Stationary)",
    locationName: "Feeder Pillar #44 • Greater Metro District",
    coordinates: "28.5355° N, 77.3910° E",
    battery: 98,
    batteryVoltage: "3.65V LiSOCl2",
    signalStrength: "-62 dBm (NB-IoT)",
    tamperState: "ARMED",
    tamperColor: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    eventDescription: "Firmly seated on socket base. Optical and pressure micro-switch continuity intact. Power consumption 14µA."
  },
  storage: {
    label: "Warehouse Inventory",
    statusText: "CENTRAL REPOSITORY",
    statusBadgeColor: "bg-blue-500/15 text-blue-500 border-blue-500/30",
    speed: "0.0 km/h (Geofenced)",
    locationName: "Warehouse Bay B • Shelf #12-D",
    coordinates: "28.6921° N, 77.1512° E",
    battery: 100,
    batteryVoltage: "3.68V LiSOCl2",
    signalStrength: "-74 dBm (LTE-M)",
    tamperState: "NORMAL",
    tamperColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    eventDescription: "Inside authorized storage geofence polygon. Power saving deep sleep mode active with 6-hour keep-alive."
  },
  detached: {
    label: "TAMPER BREACH",
    statusText: "UNAUTHORIZED DETACH",
    statusBadgeColor: "bg-red-500/15 text-red-500 border-red-500/30 animate-pulse",
    speed: "12.4 km/h (Moving Unseated)",
    locationName: "Unknown Vector • Outside Geofence Perimeter",
    coordinates: "28.5120° N, 77.4102° E",
    battery: 89,
    batteryVoltage: "3.58V LiSOCl2",
    signalStrength: "-79 dBm (Emergency Beacon)",
    tamperState: "TRIGGERED (ALARM)",
    tamperColor: "text-red-500 bg-red-500/20 border-red-500/40 animate-pulse",
    eventDescription: "CRITICAL: Base detachment sensor triggered! Meter separated from fixture without maintenance authorization. High-priority SMS & sirens broadcasted."
  }
};

export const LandingTelemetryDemo = () => {
  const [activeState, setActiveState] = useState<DemoState>("in_transit");
  const [livePings, setLivePings] = useState(482);
  const navigate = useNavigate();

  const cfg = stateConfigs[activeState];

  const handleSimulatePing = () => {
    setLivePings(p => p + 1);
  };

  return (
    <section id="telemetry-demo" className="py-20 lg:py-28 relative bg-gradient-to-b from-transparent via-muted/20 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Interactive Live Simulator
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Experience Real-Time Telemetry & Tamper Detection
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Test how MeterTrack beacons respond in transit, when locked in storage, and during an instant detachment tampering scenario.
          </p>

          {/* State Switcher Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            <button
              onClick={() => setActiveState("in_transit")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeState === "in_transit"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              In Transit
            </button>

            <button
              onClick={() => setActiveState("installed")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeState === "installed"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Installed & Seated
            </button>

            <button
              onClick={() => setActiveState("storage")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeState === "storage"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                  : "bg-card border border-border/80 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Storage Geofence
            </button>

            <button
              onClick={() => setActiveState("detached")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeState === "detached"
                  ? "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/40 scale-105 animate-pulse"
                  : "bg-card border border-destructive/30 text-destructive hover:bg-destructive/10"
              }`}
            >
              <Unplug className="w-3.5 h-3.5" />
              Simulate Tamper / Detach!
            </button>
          </div>
        </div>

        {/* Simulator Cockpit Box */}
        <div className="rounded-3xl border border-border/80 bg-card/90 backdrop-blur-2xl p-6 lg:p-8 shadow-2xl space-y-8">
          
          {/* Top Status Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 p-2 flex items-center justify-center shrink-0">
                <img src="/smart-meter.png" alt="Smart Meter Beacon" className="w-full h-full object-contain" />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card bg-emerald-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-mono text-foreground">
                    BEACON-METER-ID: #SM-88902
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold font-mono border ${cfg.statusBadgeColor}`}>
                    {cfg.statusText}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Firmware v4.12 • Multi-GNSS Active • Transmit Cycle: 15s
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button
                onClick={handleSimulatePing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-mono font-medium hover:bg-muted/80 transition-colors cursor-pointer"
                title="Trigger simulated heartbeat telemetry ping"
              >
                <RefreshCw className="w-3 h-3 text-primary animate-spin" />
                <span>Pings: {livePings}</span>
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
              >
                <span>Open Live Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Telemetry Telemetry Gauges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Tamper Status Box */}
            <div className={`p-4 rounded-2xl border ${activeState === 'detached' ? 'border-destructive/60 bg-destructive/10' : 'border-border/60 bg-muted/20'} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Tamper & Base Sensor</span>
                <ShieldAlert className={`w-4 h-4 ${activeState === 'detached' ? 'text-destructive' : 'text-emerald-500'}`} />
              </div>
              <div className={`text-base font-bold font-mono tracking-tight ${activeState === 'detached' ? 'text-destructive' : 'text-emerald-500'}`}>
                {cfg.tamperState}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {activeState === 'detached' ? 'Tamper switch open! 1.1s alert sent' : 'Physical seat switch contact closed'}
              </div>
            </div>

            {/* Coordinates & Location */}
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">GPS Coordinates</span>
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="text-sm font-bold font-mono text-foreground truncate">
                {cfg.coordinates}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {cfg.locationName}
              </div>
            </div>

            {/* Battery & Power */}
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Battery & Voltage</span>
                <BatteryCharging className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-base font-bold font-mono text-foreground flex items-center gap-2">
                <span>{cfg.battery}%</span>
                <span className="text-xs text-muted-foreground font-normal">({cfg.batteryVoltage})</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Est. Lifespan: 9.8 Years remaining
              </div>
            </div>

            {/* Connectivity */}
            <div className="p-4 rounded-2xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">Cellular & Radio</span>
                <Wifi className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-sm font-bold font-mono text-foreground truncate">
                {cfg.signalStrength}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Speed: {cfg.speed}
              </div>
            </div>

          </div>

          {/* Event Log Output Panel */}
          <div className="rounded-2xl border border-border/70 bg-background/80 p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground border-b border-border/40 pb-2">
              <div className="flex items-center gap-2">
                <BellRing className="w-3.5 h-3.5 text-primary" />
                <span className="font-semibold text-foreground">Active Telemetry Diagnostic Stream</span>
              </div>
              <span className="text-[10px] uppercase">Channel: NB-IoT/GNSS Secure Socket</span>
            </div>
            
            <p className="text-foreground/90 leading-relaxed font-sans text-sm pt-1">
              {cfg.eventDescription}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                Payload Signature: SHA-256 Valid
              </span>
              <span>•</span>
              <span>Geofence Boundary: In Compliance</span>
              <span>•</span>
              <button
                onClick={() => navigate("/auth")}
                className="text-primary font-bold hover:underline cursor-pointer"
              >
                Sign in to view historical trajectory →
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
