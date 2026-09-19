import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowRight, 
  LogIn, 
  Radio, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowUp, 
  CheckCircle2, 
  ExternalLink,
  Cpu,
  Globe
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

export const LandingFooter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [emailInput, setEmailInput] = useState("");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    toast({
      title: "Telemetry Bulletin Subscribed",
      description: `Updates will be sent to ${emailInput.trim()}`,
    });
    setEmailInput("");
  };

  return (
    <footer className="relative border-t border-border/70 bg-gradient-to-b from-background via-card/50 to-card overflow-hidden">
      
      {/* Ambient background lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] pointer-events-none" />

      {/* Pre-Footer CTA Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="relative rounded-3xl p-8 sm:p-12 border border-primary/30 bg-gradient-to-r from-primary/15 via-card/80 to-primary/10 backdrop-blur-2xl shadow-2xl overflow-hidden">
          
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Theft Grid Guarantee
              </div>
              <h3 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Ready to Secure Your Smart Grid Deployment?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
                Join leading utility distributors monitoring over 50,000 smart electricity meters in real time. Launch your operator console now.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-stretch">
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-gradient-to-r from-primary via-primary to-amber-500 text-primary-foreground font-bold text-sm shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Operator Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-card border border-border hover:border-primary/40 text-foreground font-semibold text-sm transition-all cursor-pointer"
              >
                <span>Create New Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Branding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1: Brand & Logo with smart-meter.png icon (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/25 via-primary/10 to-transparent border border-primary/40 p-2 shadow-lg shadow-primary/15 group-hover:border-primary transition-colors">
                <img 
                  src="/smart-meter.png" 
                  alt="MeterTrack Beacon Icon" 
                  className="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(249,115,22,0.4)]"
                />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                </span>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-foreground font-mono">
                  METER<span className="text-primary font-extrabold">TRACK</span>
                </span>
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                  Beacon & Grid Telemetry
                </p>
              </div>
            </Link>

            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Enterprise IoT hardware, multi-GNSS tracking, and sub-second detachment detection engineered for power distribution utilities, logistics fleets, and smart grids.
            </p>

            {/* System Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-muted/40 border border-border text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">All Systems Operational</span>
              <span className="text-muted-foreground">• 99.99% Uptime</span>
            </div>

            {/* Security Badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>AES-256 Encrypted Telemetry Ingestion</span>
            </div>
          </div>

          {/* Column 2: Platform Capabilities (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Live Fleet Radar
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Detachment Sentinel
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Polygon Geofences
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Battery Analytics AI
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  SCADA & REST APIs
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Utility Solutions (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Public DISCOMs
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Private Microgrids
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Factory Ingestion
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Corridor Protection
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/auth")} className="hover:text-primary transition-colors text-left cursor-pointer">
                  Anti-Tamper Recovery
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Operator Direct Sign-In & Telemetry Newsletter (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="rounded-2xl p-5 border border-primary/25 bg-card/80 backdrop-blur-xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  Operator Console
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Authorized grid technicians and dispatchers can access live meter telemetry immediately.
              </p>
              <button
                onClick={() => navigate("/auth")}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In to Dashboard Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Newsletter form */}
            <form onSubmit={handleSubscribe} className="space-y-2">
              <label htmlFor="footer-email" className="text-xs font-semibold text-foreground">
                Smart Grid Engineering Dispatch
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="footer-email"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="engineer@utility-grid.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-muted/40 border border-border/80 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground transition-colors cursor-pointer shrink-0"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} MeterTrack / MeterBeacon Systems Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors cursor-pointer">
              Security Compliance
            </button>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-muted/50 hover:bg-muted border border-border text-foreground transition-colors cursor-pointer flex items-center gap-1"
              title="Scroll back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Top</span>
            </button>
          </div>

        </div>
      </div>

    </footer>
  );
};
