import { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does the sub-second detachment tamper detection work?",
    answer: "Each MeterTrack unit incorporates both a mechanical plunger micro-switch and a sensitive ambient light optical sensor seated against the meter socket base. The moment a meter is physically pulled or unseated, the switch breaks continuity and the optical sensor detects ambient light, immediately broadcasting an emergency high-priority packet over cellular LTE-M in under 1.2 seconds."
  },
  {
    question: "What powers the beacon and how does it achieve a 10-year lifespan?",
    answer: "The beacon is powered by an industrial-grade Lithium Thionyl Chloride (Li-SOCl2) primary cell with ultra-low self-discharge (<1% per year). During stationary periods inside authorized geofences, the hardware enters microampere deep-sleep mode, waking only for scheduled keep-alive pulses or motion-triggered accelerometer events."
  },
  {
    question: "Can MeterTrack beacons be retrofitted into existing deployed meters?",
    answer: "Yes. MeterTrack provides both factory-integrated internal modules and external tamper-sealed adhesive socket beacons compatible with ANSI and IEC standard single-phase and three-phase meter form factors."
  },
  {
    question: "What happens when a delivery truck drives through areas with zero cellular signal?",
    answer: "The onboard memory stores up to 20,000 encrypted GNSS trajectory waypoints in non-volatile flash storage. Once cellular signal is re-acquired, the beacon initiates a high-throughput burst upload with full timestamp synchronization."
  },
  {
    question: "How do utility operators and technicians sign in to the platform?",
    answer: "Grid supervisors and certified technicians can use our secure enterprise console. You can click 'Sign In' anywhere on this page to log into your account, view real-time fleet maps, adjust geofences, and configure alert recipients."
  }
];

export const LandingFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const navigate = useNavigate();

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Everything You Need to Know
          </h2>
          <p className="text-base text-muted-foreground">
            Clear answers on hardware architecture, security compliance, and platform operations.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-border/70 bg-card/75 backdrop-blur-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed animate-in slide-in-from-top-2 duration-200 border-t border-border/40 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help CTA Box */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-muted/30 border border-border/60">
          <p className="text-sm text-foreground font-medium">
            Have more questions or need custom utility specifications?
          </p>
          <div className="mt-3 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <span>Sign in to contact grid engineering team</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
