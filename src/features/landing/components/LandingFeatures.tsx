import { 
  ShieldAlert, 
  Navigation, 
  Map, 
  BatteryFull, 
  Cpu, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Radio,
  FileSpreadsheet
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: ShieldAlert,
    title: "Instant Detachment & Tamper Alerts",
    description: "Optical sensors and tamper-proof micro-switches trigger high-priority alerts within 1.2 seconds if a meter is unseated, opened, or physically dislodged.",
    badge: "< 1.2s Response",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20"
  },
  {
    icon: Navigation,
    title: "Multi-Constellation High Precision GNSS",
    description: "Concurrent GPS, GLONASS, Galileo, and BeiDou satellite tracking backed by cellular triangulation ensure pinpoint tracking even in dense urban canyons.",
    badge: "Sub-Meter Accuracy",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20"
  },
  {
    icon: Map,
    title: "Dynamic Polygon & Corridor Geofencing",
    description: "Define multi-vertex boundaries around warehouse perimeters, transit corridors, and district zones. Automated instant notifications upon breach.",
    badge: "Polygon Geofences",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20"
  },
  {
    icon: BatteryFull,
    title: "10+ Year Autonomous Battery Architecture",
    description: "Ultra-low power sleep states and intelligent motion-activated reporting profiles deliver an unprecedented 10-year lifespan on primary lithium cells.",
    badge: "Ultra-Low Power",
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/20"
  },
  {
    icon: Cpu,
    title: "Automated Supply Chain Custody",
    description: "Continuous lifecycle transition tracking: Manufacturing Ingestion → Storage → In Transit → Field Installed → Decommissioned.",
    badge: "Full Audit Trail",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20"
  },
  {
    icon: Lock,
    title: "Military-Grade Cryptographic Security",
    description: "End-to-end AES-256 payload encryption with hardware secure elements. Compliant with electrical utility grid security standards and ISO 27001.",
    badge: "AES-256 & TLS 1.3",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/20"
  }
];

export const LandingFeatures = () => {
  const navigate = useNavigate();

  return (
    <section id="features" className="py-20 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5" />
            Enterprise Grade Intelligence
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Engineered for Mission-Critical Utility Operations
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Eliminate meter theft, delivery diversion, and unauthorized removals with automated GPS tracking and intelligent hardware telemetry.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div 
                key={index}
                className="group relative rounded-3xl p-7 border border-border/60 bg-card/60 hover:bg-card/90 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header with Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl ${feat.bgColor} ${feat.color} border ${feat.borderColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-muted border border-border/50 text-foreground/80">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary group-hover:text-primary">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner inside features */}
        <div className="mt-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary/15 via-amber-500/10 to-primary/5 border border-primary/20 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">
                Need customized SCADA or MDMS Integration?
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                MeterTrack exposes real-time REST and WebSocket telemetry streams for enterprise grid operators.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/auth")}
            className="shrink-0 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-md shadow-primary/25 hover:bg-primary/90 transition-all cursor-pointer"
          >
            Sign In for API Access
          </button>
        </div>

      </div>
    </section>
  );
};
