import { MapPin, Maximize2 } from "lucide-react";
import { Tracker, statusConfig } from "@/data/mockData";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

interface MapViewProps {
  trackers: Tracker[];
}

export function MapView({ trackers }: MapViewProps) {
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);
  const markersRef = useRef<HTMLDivElement>(null);

  const minLat = 28.40, maxLat = 28.76, minLng = 77.02, maxLng = 77.42;
  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * 100;
  const toY = (lat: number) => (1 - (lat - minLat) / (maxLat - minLat)) * 100;

  useEffect(() => {
    if (!markersRef.current) return;
    const markers = markersRef.current.querySelectorAll('.tracker-marker');
    gsap.fromTo(markers, 
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.7)" }
    );
  }, []);

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Live Tracking Map</h3>
          <span className="badge-glass text-primary text-[10px]">{trackers.length} devices</span>
        </div>
        <button className="glass-card p-1.5 rounded-lg hover:shadow-sm transition-all">
          <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Map Area */}
      <div className="relative h-[400px] bg-muted/30" ref={markersRef}>
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {[...Array(10)].map((_, i) => (
            <g key={i}>
              <line x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="hsla(var(--chart-grid))" strokeWidth="1" />
              <line x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="hsla(var(--chart-grid))" strokeWidth="1" />
            </g>
          ))}
        </svg>

        {/* Road-like paths */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M 10% 20% Q 30% 40%, 50% 35% T 90% 60%" stroke="hsla(var(--chart-grid))" strokeWidth="2" fill="none" />
          <path d="M 20% 80% Q 40% 50%, 60% 55% T 85% 25%" stroke="hsla(var(--chart-grid))" strokeWidth="2" fill="none" />
          <path d="M 5% 50% L 95% 50%" stroke="hsla(var(--chart-grid))" strokeWidth="1.5" fill="none" strokeDasharray="8,4" />
        </svg>

        {/* Region Labels */}
        <span className="absolute top-[15%] left-[20%] text-[9px] text-muted-foreground/40 font-mono">NORTH DELHI</span>
        <span className="absolute top-[50%] left-[10%] text-[9px] text-muted-foreground/40 font-mono">GURGAON</span>
        <span className="absolute top-[30%] right-[15%] text-[9px] text-muted-foreground/40 font-mono">NOIDA</span>
        <span className="absolute bottom-[20%] left-[40%] text-[9px] text-muted-foreground/40 font-mono">FARIDABAD</span>

        {/* Tracker markers */}
        {trackers.map((tracker) => {
          const x = toX(tracker.longitude);
          const y = toY(tracker.latitude);
          const config = statusConfig[tracker.status];
          return (
            <button
              key={tracker.id}
              className="tracker-marker absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setSelectedTracker(selectedTracker?.id === tracker.id ? null : tracker)}
            >
              <div className="relative">
                <div className={`${config.dotClass} w-3.5 h-3.5 transition-transform group-hover:scale-150`} />
                {tracker.status === 'in_transit' && (
                  <div className={`absolute inset-0 ${config.dotClass} w-3.5 h-3.5 animate-ping opacity-40`} />
                )}
              </div>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {tracker.device_id}
              </span>
            </button>
          );
        })}

        {/* Selected tracker popup */}
        {selectedTracker && (
          <div
            className="absolute z-20 glass-card p-3 w-52 animate-slide-up rounded-xl"
            style={{
              left: `${Math.min(toX(selectedTracker.longitude), 70)}%`,
              top: `${Math.min(toY(selectedTracker.latitude) + 5, 70)}%`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-foreground">{selectedTracker.device_id}</span>
              <div className={statusConfig[selectedTracker.status].dotClass} />
            </div>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meter</span>
                <span className="font-mono text-foreground">{selectedTracker.meter_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="text-foreground">{statusConfig[selectedTracker.status].label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Battery</span>
                <span className={`font-bold ${selectedTracker.battery_level < 20 ? 'text-destructive' : 'text-success'}`}>{selectedTracker.battery_level}%</span>
              </div>
              {selectedTracker.assigned_to && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned</span>
                  <span className="text-foreground">{selectedTracker.assigned_to}</span>
                </div>
              )}
              {selectedTracker.route && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route</span>
                  <span className="text-primary">{selectedTracker.route}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-mono text-foreground">{selectedTracker.latitude.toFixed(4)}, {selectedTracker.longitude.toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 p-3 border-t border-border/40">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`${config.dotClass} w-2 h-2`} />
            <span className="text-[10px] text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
