import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { 
  MapPin, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
} from "lucide-react";
import type { Tracker, TrackerStatus } from "@/shared/types";
import { statusConfig } from "@/data/mockData";

interface MapViewProps {
  trackers: Tracker[];
  onSelectTracker?: (tracker: Tracker) => void;
}

type TileTheme = "streets" | "dark" | "satellite";

const TILE_LAYERS: Record<TileTheme, { url: string; attribution: string; subdomains?: string; maxZoom?: number }> = {
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "abc",
    maxZoom: 19,
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 18,
  },
};

const STATUS_COLORS: Record<TrackerStatus, { main: string; bg: string; border: string }> = {
  in_storage: { main: "#3b82f6", bg: "rgba(59, 130, 246, 0.2)", border: "#60a5fa" },
  in_transit: { main: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)", border: "#fbbf24" },
  installed_off: { main: "#10b981", bg: "rgba(16, 185, 129, 0.2)", border: "#34d399" },
  detached: { main: "#ef4444", bg: "rgba(239, 68, 68, 0.2)", border: "#f87171" },
};

export function MapView({ trackers, onSelectTracker }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.FeatureGroup | null>(null);

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [tileTheme, setTileTheme] = useState<TileTheme>("streets");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedTracker, setSelectedTracker] = useState<Tracker | null>(null);

  // Filter trackers
  const filteredTrackers = trackers.filter((t) => {
    if (activeFilter === "all") return true;
    return t.status === activeFilter;
  });

  // Status counts for filter pills
  const statusCounts = {
    all: trackers.length,
    in_transit: trackers.filter((t) => t.status === "in_transit").length,
    in_storage: trackers.filter((t) => t.status === "in_storage").length,
    installed_off: trackers.filter((t) => t.status === "installed_off").length,
    detached: trackers.filter((t) => t.status === "detached").length,
  };

  // Helper to create tile layer
  const createTileLayer = (theme: TileTheme) => {
    const config = TILE_LAYERS[theme] || TILE_LAYERS.streets;
    return L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom || 19,
      subdomains: config.subdomains || "abc",
      crossOrigin: true,
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance centered on Delhi NCR with boundary locks
    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: [
        [28.15, 76.75],
        [29.05, 77.65],
      ],
      maxBoundsViscosity: 0.8,
      zoomControl: false,
      attributionControl: true,
    });

    // Custom positioned zoom controls
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Initial tile layer (Streets/OpenStreetMap)
    const tileLayer = createTileLayer(tileTheme).addTo(map);
    const markersLayer = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersLayer;

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    // Invalidate map size to prevent rendering tile cutoffs
    setTimeout(() => map.invalidateSize(), 50);
    setTimeout(() => map.invalidateSize(), 200);
    setTimeout(() => map.invalidateSize(), 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update tile layer on theme change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newLayer = createTileLayer(tileTheme).addTo(map);
    tileLayerRef.current = newLayer;
  }, [tileTheme]);


  // Update markers when filteredTrackers or status changes
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!markersLayer || !map) return;

    markersLayer.clearLayers();

    if (filteredTrackers.length === 0) return;

    filteredTrackers.forEach((tracker) => {
      const colors = STATUS_COLORS[tracker.status] || STATUS_COLORS.in_storage;
      const isTransit = tracker.status === "in_transit";
      const isDetached = tracker.status === "detached";

      // Custom HTML Marker using DivIcon
      const markerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 38px; height: 38px;">
          ${(isTransit || isDetached) ? `
            <div class="absolute inset-0 rounded-full animate-marker-radar pointer-events-none" 
                 style="background-color: ${colors.main}; opacity: 0.35;"></div>
          ` : ""}
          <div class="w-8 h-8 rounded-full shadow-lg flex items-center justify-center transition-transform transform group-hover:scale-125 duration-200"
               style="background-color: ${colors.main}; border: 2px solid #ffffff; box-shadow: 0 0 12px ${colors.main}99;">
            <span style="font-size: 11px; font-weight: 700; color: #ffffff; font-family: monospace;">
              ${tracker.device_id.replace('TRK-', '')}
            </span>
          </div>
          <div class="absolute -bottom-5 px-1.5 py-0.5 rounded text-[9px] font-mono bg-background/90 text-foreground border border-border/60 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
            ${tracker.device_id}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-tracker-div-icon",
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
      });

      const marker = L.marker([tracker.latitude, tracker.longitude], {
        icon: customIcon,
      });

      // Rich popup content
      const statusInfo = statusConfig[tracker.status] || { label: tracker.status };
      const batteryColor = tracker.battery_level < 20 ? "#ef4444" : tracker.battery_level < 50 ? "#f59e0b" : "#10b981";

      const popupHtml = `
        <div style="padding: 14px; min-width: 220px; font-family: inherit;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
            <div style="font-weight: 700; font-size: 13px; font-family: monospace; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${colors.main};"></span>
              ${tracker.device_id}
            </div>
            <span style="font-size: 10px; padding: 2px 6px; border-radius: 9999px; background: ${colors.bg}; color: ${colors.main}; font-weight: 600; text-transform: uppercase;">
              ${statusInfo.label}
            </span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="opacity: 0.7;">Meter ID:</span>
              <span style="font-family: monospace; font-weight: 600;">${tracker.meter_id}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="opacity: 0.7;">Battery Level:</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <div style="width: 45px; height: 6px; background: rgba(128,128,128,0.2); border-radius: 3px; overflow: hidden;">
                  <div style="width: ${tracker.battery_level}%; height: 100%; background: ${batteryColor}; border-radius: 3px;"></div>
                </div>
                <span style="font-weight: 700; color: ${batteryColor};">${tracker.battery_level}%</span>
              </div>
            </div>

            ${tracker.assigned_to ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="opacity: 0.7;">Assigned:</span>
                <span style="font-weight: 500;">${tracker.assigned_to}</span>
              </div>
            ` : ""}

            ${tracker.route ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="opacity: 0.7;">Route:</span>
                <span style="color: #f59e0b; font-weight: 500;">${tracker.route}</span>
              </div>
            ` : ""}

            ${tracker.warehouse ? `
              <div style="display: flex; justify-content: space-between;">
                <span style="opacity: 0.7;">Warehouse:</span>
                <span style="color: #3b82f6; font-weight: 500;">${tracker.warehouse}</span>
              </div>
            ` : ""}

            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 2px;">
              <span style="opacity: 0.7;">Coordinates:</span>
              <span style="font-family: monospace; opacity: 0.9;">${tracker.latitude.toFixed(4)}, ${tracker.longitude.toFixed(4)}</span>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: true,
        className: "custom-tracker-popup",
      });

      marker.on("click", () => {
        setSelectedTracker(tracker);
        if (onSelectTracker) onSelectTracker(tracker);
      });

      markersLayer.addLayer(marker);
    });

    // Auto-fit bounds if markers exist
    if (markersLayer.getLayers().length > 0) {
      map.fitBounds(markersLayer.getBounds(), { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredTrackers, activeFilter]);

  // Fit all bounds manually
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const bounds = markersLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
  };

  return (
    <div className={`glass-card overflow-hidden rounded-2xl flex flex-col transition-all duration-300 border border-border/50 shadow-sm ${
      isFullscreen ? "fixed inset-4 z-50 shadow-2xl bg-card" : "relative w-full"
    }`}>
      {/* Top Header & Map Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/40 bg-card/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground tracking-tight">Live Tracking Map</h3>
              <span className="badge-glass text-primary text-[10px] font-mono px-2 py-0.5">
                {filteredTrackers.length} / {trackers.length} Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Interactive real-time fleet GPS tracking across Delhi NCR
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Tile Layer Selector */}
          <div className="flex items-center bg-secondary/50 border border-border/50 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setTileTheme("streets")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                tileTheme === "streets" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setTileTheme("dark")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                tileTheme === "dark" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTileTheme("satellite")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                tileTheme === "satellite" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Reset View Button */}
          <button
            onClick={handleFitBounds}
            title="Fit All Trackers"
            className="glass-card-hover p-2 rounded-lg text-muted-foreground hover:text-foreground border border-border/40 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="glass-card-hover p-2 rounded-lg text-muted-foreground hover:text-foreground border border-border/40 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative z-20 flex items-center gap-2 px-4 py-2 bg-secondary/30 border-b border-border/30 overflow-x-auto text-xs no-scrollbar backdrop-blur-md">
        <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mr-1">
          Filter:
        </span>
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === "all"
              ? "bg-foreground text-background shadow-sm"
              : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/40"
          }`}
        >
          All
          <span className="opacity-70 text-[10px]">({statusCounts.all})</span>
        </button>

        <button
          onClick={() => setActiveFilter("in_transit")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === "in_transit"
              ? "bg-warning text-warning-foreground font-semibold shadow-sm"
              : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/40"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-warning"></span>
          In Transit
          <span className="opacity-70 text-[10px]">({statusCounts.in_transit})</span>
        </button>

        <button
          onClick={() => setActiveFilter("in_storage")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === "in_storage"
              ? "bg-info text-info-foreground font-semibold shadow-sm"
              : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/40"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-info"></span>
          In Storage
          <span className="opacity-70 text-[10px]">({statusCounts.in_storage})</span>
        </button>

        <button
          onClick={() => setActiveFilter("installed_off")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === "installed_off"
              ? "bg-success text-success-foreground font-semibold shadow-sm"
              : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/40"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-success"></span>
          Installed
          <span className="opacity-70 text-[10px]">({statusCounts.installed_off})</span>
        </button>

        <button
          onClick={() => setActiveFilter("detached")}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${
            activeFilter === "detached"
              ? "bg-destructive text-destructive-foreground font-semibold shadow-sm"
              : "bg-background/80 text-muted-foreground hover:text-foreground border border-border/40"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-destructive"></span>
          Detached
          <span className="opacity-70 text-[10px]">({statusCounts.detached})</span>
        </button>
      </div>

      {/* Real Map Canvas Container */}
      <div 
        className="w-full relative z-10 overflow-hidden bg-muted/10"
        style={{ 
          height: isFullscreen ? "calc(100vh - 160px)" : "450px",
          minHeight: isFullscreen ? "calc(100vh - 160px)" : "450px"
        }}
      >
        <div 
          ref={mapContainerRef} 
          className="w-full h-full"
          style={{ width: "100%", height: "100%", minHeight: "100%" }}
        />
      </div>

      {/* Bottom Summary Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-3 border-t border-border/40 bg-card/95 backdrop-blur-md text-[11px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning animate-pulse"></span>
            <span className="text-muted-foreground font-medium">Live GPS Feed</span>
          </div>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">
            Map bounds: <span className="font-mono text-foreground font-semibold">Delhi NCR (28.4°N - 28.8°N)</span>
          </span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Click any marker to inspect battery, meter, and routes</span>
        </div>
      </div>
    </div>
  );
}
