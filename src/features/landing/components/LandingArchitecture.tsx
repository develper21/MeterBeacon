import { 
  Cpu, 
  Layers, 
  Radio, 
  ShieldCheck, 
  Truck, 
  Warehouse, 
  CheckCircle, 
  AlertTriangle,
  Server,
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const pipelineSteps = [
  {
    step: "01",
    title: "Factory Ingestion & Serialization",
    desc: "Meters are scanned at manufacturing dispatch. Each beacon binds its unique IMEI, cryptographic key, and hardware ID to the grid inventory database.",
    icon: Warehouse,
    tag: "Warehouse Custody"
  },
  {
    step: "02",
    title: "In-Transit Route Corridor Guard",
    desc: "During truck transit, GNSS beacons broadcast periodic coordinates. High-frequency alerts trigger instantly if a vehicle deviates from its pre-approved path.",
    icon: Truck,
    tag: "Logistics Tracking"
  },
  {
    step: "03",
    title: "Field Installation & Seated Lock",
    desc: "Technicians mount the meter. Base micro-switches and optical sensors engage, geo-locking the meter coordinates to the consumer's premises.",
    icon: CheckCircle,
    tag: "Field Geo-Lock"
  },
  {
    step: "04",
    title: "Autonomous Tamper Sentinel",
    desc: "24/7 background monitoring with deep sleep. Detects unauthorized physical removal, reverse-polarity tampering, or electrical bypass with sub-second alert.",
    icon: ShieldCheck,
    tag: "Anti-Theft Sentinel"
  }
];

const hardwareSpecs = [
  { label: "Cellular Connectivity", value: "LTE-M (Cat-M1), NB-IoT, 2G Fallback" },
  { label: "GNSS Constellations", value: "GPS, GLONASS, Galileo, BeiDou, QZSS" },
  { label: "Tamper Sensors", value: "Optical ambient sensor & mechanical seat switch" },
  { label: "Battery Chemistry", value: "Li-SOCl2 Primary Cell (19,000 mAh)" },
  { label: "Operating Temperature", value: "-40°C to +85°C (Industrial Grade)" },
  { label: "Enclosure Ingress", value: "IP68 Water & Dust Submersible Proof" }
];

export const LandingArchitecture = () => {
  const navigate = useNavigate();

  return (
    <section id="hardware" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            Hardware & Grid Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            End-to-End Asset Protection Pipeline
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            From the factory assembly line to consumer premises, MeterTrack provides zero-trust security and continuous location validation.
          </p>
        </div>

        {/* 4-Step Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="relative rounded-3xl p-6 border border-border/70 bg-card/70 backdrop-blur-xl hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-mono font-extrabold text-primary/80">
                      {step.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-border/40">
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                    {step.tag}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hardware Deep Dive Showcase with smart-meter.png */}
        <div id="architecture" className="rounded-3xl border border-border/80 bg-gradient-to-br from-card/90 via-card/80 to-background/95 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left: Hardware Graphic */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl p-6 bg-gradient-to-tr from-muted/50 to-primary/10 border border-primary/25 shadow-xl flex items-center justify-center group">
                <img 
                  src="/smart-meter.png" 
                  alt="MeterTrack Hardware Beacon" 
                  className="w-full h-full object-contain drop-shadow-[0_10px_25px_rgba(249,115,22,0.35)] group-hover:scale-105 transition-transform duration-500" 
                />
                
                {/* Floating pill */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-background/90 border border-primary/40 text-[11px] font-mono font-bold text-primary shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Tamper Optical Switch Arm
                </div>
              </div>
            </div>

            {/* Right: Technical Specifications */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary uppercase tracking-wider mb-2">
                  <Server className="w-3.5 h-3.5" />
                  Hardware Specifications & Enclosure
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Ruggedized for Harsh Field Environments
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Designed to operate maintenance-free for over a decade in extreme temperature ranges, high electromagnetic noise, and outdoor weather exposure.
                </p>
              </div>

              {/* Specs Table */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {hardwareSpecs.map((spec, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-muted/40 border border-border/50">
                    <div className="text-[11px] font-medium text-muted-foreground">
                      {spec.label}
                    </div>
                    <div className="text-xs font-bold text-foreground font-mono mt-0.5">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
                >
                  <span>Access Management Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  Includes comprehensive telemetry SDK & REST APIs
                </span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
