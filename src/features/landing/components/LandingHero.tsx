import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  ShieldCheck, 
  Radio, 
  Zap, 
  MapPin, 
  BatteryCharging, 
  Lock, 
  Sparkles,
  Activity,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export const LandingHero = () => {
  const navigate = useNavigate();

  const scrollToDemo = () => {
    const demo = document.getElementById("telemetry-demo");
    if (demo) {
      demo.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-primary/20 via-amber-500/10 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-primary/15 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-xs font-semibold text-primary backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="tracking-wide uppercase font-mono text-[11px]">
                Smart Grid Telemetry v2.4 Live
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-foreground/90 font-medium">Anti-Theft Geofence Ready</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
                Next-Gen GPS &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-500 to-orange-400">
                  Tamper Beacon
                </span>{" "}
                Tracking for Smart Meters
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Protect your smart grid assets from factory to field install. Real-time multi-constellation GPS tracking, instantaneous detachment alerts, polygon geofencing, and automated chain of custody.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-primary to-amber-500 text-primary-foreground font-bold text-base shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <span>Sign In to Platform</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={scrollToDemo}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-background/80 hover:bg-muted/70 text-foreground font-semibold text-base border border-border/80 hover:border-primary/40 backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                <Activity className="w-5 h-5 text-primary" />
                <span>Explore Live Simulator</span>
              </button>
            </div>

            {/* Value Props / Quick Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/50 text-left">
              <div className="space-y-1">
                <div className="text-2xl font-bold font-mono text-foreground">&lt; 1.2s</div>
                <div className="text-xs text-muted-foreground font-medium">Detach Tamper Alert</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold font-mono text-foreground">99.99%</div>
                <div className="text-xs text-muted-foreground font-medium">Geofence Accuracy</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold font-mono text-foreground">10+ Yrs</div>
                <div className="text-xs text-muted-foreground font-medium">Beacon Battery Life</div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold font-mono text-foreground">50,000+</div>
                <div className="text-xs text-muted-foreground font-medium">Trackers Deployed</div>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual Showcase with smart-meter-bg.png & smart-meter.png */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Outer Glow Ring */}
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary/30 to-amber-500/20 blur-2xl opacity-60 animate-pulse-glow" />

            {/* Main Interactive Showcase Card */}
            <div className="relative w-full max-w-md rounded-3xl border border-border/70 bg-gradient-to-b from-card/90 via-card/80 to-background/95 backdrop-blur-2xl p-5 shadow-2xl overflow-hidden group">
              
              {/* Top Card Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 p-1 flex items-center justify-center">
                    <img src="/smart-meter.png" alt="Smart Meter Beacon" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-mono tracking-wide text-foreground">
                      SM-BEACON-X400
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      4G LTE-M • GNSS Active
                    </div>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold font-mono">
                  IN TRANSIT
                </div>
              </div>

              {/* Central Meter Image Box using smart-meter-bg.png */}
              <div className="relative my-4 rounded-2xl overflow-hidden border border-border/60 bg-muted/20 aspect-square flex items-center justify-center shadow-inner">
                <img 
                  src="/smart-meter-bg.png" 
                  alt="Smart Meter Hardware Visual" 
                  className="w-full h-full object-cover rounded-xl transition-transform duration-700 group-hover:scale-105" 
                />

                {/* Holographic Radar Pulse Animation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Floating Telemetry Chips on Image */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-background/85 backdrop-blur-md border border-border/60 text-[11px] font-mono font-medium shadow-md flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span>4G LTE-M: -72 dBm</span>
                </div>

                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-emerald-500/90 text-white backdrop-blur-md text-[11px] font-mono font-bold shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tamper: ARMED</span>
                </div>

                {/* Bottom Overlay with Real-time Coordinates */}
                <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-background/90 backdrop-blur-md border border-border/70 text-xs shadow-lg space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" />
                      Lat: 28.6139° N, 77.2090° E
                    </span>
                    <span className="text-foreground font-semibold">Speed: 46 km/h</span>
                  </div>
                  
                  {/* Progress Bar for Custody Route */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                      <span>Central Warehouse</span>
                      <span className="text-primary font-semibold">Destination: Substation #14</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full w-[68%]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Telemetry Metrics Row */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <div className="flex items-center justify-center gap-1 text-emerald-500 text-xs font-mono font-bold">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    96%
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">Battery Level</div>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <div className="text-xs font-mono font-bold text-foreground">
                    12 Satellites
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">GPS / BeiDou</div>
                </div>

                <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40">
                  <div className="text-xs font-mono font-bold text-primary">
                    27.4 °C
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">Core Temp</div>
                </div>
              </div>

              {/* Direct Auth Quick Action Banner */}
              <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">
                  Ready to access your fleet?
                </span>
                <button
                  onClick={() => navigate("/auth")}
                  className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
