import { LandingNavbar } from "./LandingNavbar";
import { LandingHero } from "./LandingHero";
import { LandingFeatures } from "./LandingFeatures";
import { LandingTelemetryDemo } from "./LandingTelemetryDemo";
import { LandingArchitecture } from "./LandingArchitecture";
import { LandingFAQ } from "./LandingFAQ";
import { LandingFooter } from "./LandingFooter";
import { usePageReveal } from "@/shared/hooks/useGSAP";

const LandingPage = () => {
  const pageRef = usePageReveal();

  return (
    <div ref={pageRef} className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Sticky Navigation with smart-meter.png icon & Sign In action */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with smart-meter-bg.png & smart-meter.png visuals */}
        <LandingHero />

        {/* Feature Highlights Grid */}
        <LandingFeatures />

        {/* Interactive Live Telemetry & Detachment Tamper Simulator */}
        <LandingTelemetryDemo />

        {/* Hardware Architecture & 4-Step Pipeline */}
        <LandingArchitecture />

        {/* Frequently Asked Questions */}
        <LandingFAQ />
      </main>

      {/* Comprehensive Better Footer Section with Sign In navigation */}
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
