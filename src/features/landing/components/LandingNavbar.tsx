import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { 
  Menu, 
  X, 
  ArrowRight, 
  LogIn, 
  LayoutDashboard, 
  Radio 
} from "lucide-react";

export const LandingNavbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo with smart-meter.png icon */}
        <Link 
          to="/" 
          className="flex items-center gap-3 group transition-transform hover:scale-[1.02]"
        >
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 p-1.5 shadow-lg shadow-primary/10 group-hover:border-primary/60 group-hover:shadow-primary/20 transition-all duration-300">
            <img 
              src="/smart-meter.png" 
              alt="Smart Meter Beacon Logo" 
              className="w-full h-full object-contain drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground font-mono">
                METER<span className="text-primary font-extrabold">TRACK</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                IoT Beacon
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground tracking-wide font-medium">
              Smart Meter GPS & Custody Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <button 
            onClick={() => scrollToSection("features")}
            className="hover:text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Capabilities
          </button>
          <button 
            onClick={() => scrollToSection("hardware")}
            className="hover:text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Hardware Tech
          </button>
          <button 
            onClick={() => scrollToSection("telemetry-demo")}
            className="hover:text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Live Simulator
          </button>
          <button 
            onClick={() => scrollToSection("architecture")}
            className="hover:text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Architecture
          </button>
          <button 
            onClick={() => scrollToSection("faq")}
            className="hover:text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Desktop Action Buttons: Sign In / Launch */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-primary/40 transition-all duration-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-foreground hover:text-primary hover:bg-primary/10 border border-border/80 hover:border-primary/30 transition-all duration-200 cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-primary" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-amber-500 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:brightness-105 transition-all duration-200 cursor-pointer"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => navigate("/auth")}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground"
          >
            Sign In
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/40"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3 text-base font-medium">
            <button 
              onClick={() => scrollToSection("features")}
              className="text-left py-2 text-foreground/80 hover:text-primary"
            >
              Capabilities
            </button>
            <button 
              onClick={() => scrollToSection("hardware")}
              className="text-left py-2 text-foreground/80 hover:text-primary"
            >
              Hardware Tech
            </button>
            <button 
              onClick={() => scrollToSection("telemetry-demo")}
              className="text-left py-2 text-foreground/80 hover:text-primary"
            >
              Live Simulator
            </button>
            <button 
              onClick={() => scrollToSection("architecture")}
              className="text-left py-2 text-foreground/80 hover:text-primary"
            >
              Architecture
            </button>
            <button 
              onClick={() => scrollToSection("faq")}
              className="text-left py-2 text-foreground/80 hover:text-primary"
            >
              FAQ
            </button>
          </nav>
          <div className="pt-4 border-t border-border/40 flex flex-col gap-3">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-center flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full py-2.5 rounded-xl border border-border text-foreground font-semibold text-center flex items-center justify-center gap-2 hover:bg-muted/40 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-primary" />
                  Sign In to Console
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Launch App
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
