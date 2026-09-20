import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import {
  Shield,
  Radio,
  Crosshair,
  Maximize2,
  Minimize2,
} from "lucide-react";
import type { Geofence, Tracker } from "@/shared/types";

interface GeofenceMapViewProps {
  geofences: Geofence[];
  trackers?: Tracker[];
  selectedZoneId?: string | null;
  onSelectZone?: (zone: Geofence) => void;
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

const ZONE_STYLES: Record<string, { color: string; fill: string; border: string }> = {
  warehouse: { color: "#3b82f6", fill: "rgba(59, 130, 246, 0.22)", border: "#60a5fa" },
  site: { color: "#10b981", fill: "rgba(16, 185, 129, 0.22)", border: "#34d399" },
  restricted: { color: "#ef4444", fill: "rgba(239, 68, 68, 0.25)", border: "#f87171" },
};

export function GeofenceMapView({
  geofences,
  trackers = [],
  selectedZoneId,
  onSelectZone,
}: GeofenceMapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const zonesLayerRef = useRef<L.FeatureGroup | null>(null);
  const trackersLayerRef = useRef<L.FeatureGroup | null>(null);
  const zoneCircleMapRef = useRef<Map<string, { circle: L.Circle; marker: L.Marker }>>(new Map());

  const [tileTheme, setTileTheme] = useState<TileTheme>("streets");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showTrackers, setShowTrackers] = useState<boolean>(true);

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

  // Initialize Map
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

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tileLayer = createTileLayer(tileTheme).addTo(map);
    const zonesLayer = L.featureGroup().addTo(map);
    const trackersLayer = L.featureGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    zonesLayerRef.current = zonesLayer;
    trackersLayerRef.current = trackersLayer;

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


  // Render Geofence Circles and Center Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const zonesLayer = zonesLayerRef.current;
    if (!map || !zonesLayer) return;

    zonesLayer.clearLayers();
    zoneCircleMapRef.current.clear();

    geofences.forEach((zone) => {
      const style = ZONE_STYLES[zone.type] || ZONE_STYLES.warehouse;
      const isRestricted = zone.type === "restricted";

      // 1. Precise real-world Geofence Circle
      const circle = L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: style.color,
        fillColor: style.color,
        fillOpacity: 0.22,
        weight: isRestricted ? 3 : 2,
        dashArray: isRestricted ? "6, 6" : undefined,
      });

      // 2. Center Marker with Radar pulse
      const centerMarkerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer" style="width: 32px; height: 32px;">
          <div class="absolute inset-0 rounded-full animate-marker-radar pointer-events-none" 
               style="background-color: ${style.color}; opacity: 0.4;"></div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg"
               style="background-color: ${style.color}; border: 2px solid #ffffff; box-shadow: 0 0 10px ${style.color}aa;">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
      `;

      const centerIcon = L.divIcon({
        html: centerMarkerHtml,
        className: "custom-zone-center-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      const centerMarker = L.marker([zone.lat, zone.lng], {
        icon: centerIcon,
      });

      // Rich Geofence Popup
      const popupHtml = `
        <div style="padding: 14px; min-width: 230px; font-family: inherit;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
            <div style="font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 6px;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${style.color};"></span>
              ${zone.name}
            </div>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 9999px; background: ${style.fill}; color: ${style.color}; font-weight: 700; text-transform: uppercase;">
              ${zone.type}
            </span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px;">
            <div style="display: flex; justify-content: space-between;">
              <span style="opacity: 0.7;">Perimeter Radius:</span>
              <span style="font-weight: 700; color: ${style.color};">${zone.radius} meters</span>
            </div>

            <div style="display: flex; justify-content: space-between;">
              <span style="opacity: 0.7;">Alert Trigger:</span>
              <span style="text-transform: capitalize; font-weight: 500;">${zone.alert_type}</span>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="opacity: 0.7;">Active Trackers Inside:</span>
              <span style="font-weight: 700; background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 4px;">
                ${zone.tracker_count ?? 0}
              </span>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 10px; margin-top: 2px;">
              <span style="opacity: 0.7;">Center Coordinates:</span>
              <span style="font-family: monospace;">${zone.lat.toFixed(4)}, ${zone.lng.toFixed(4)}</span>
            </div>
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml, { className: "custom-tracker-popup" });
      centerMarker.bindPopup(popupHtml, { className: "custom-tracker-popup" });

      circle.on("click", () => {
        if (onSelectZone) onSelectZone(zone);
      });
      centerMarker.on("click", () => {
        if (onSelectZone) onSelectZone(zone);
      });

      zonesLayer.addLayer(circle);
      zonesLayer.addLayer(centerMarker);

      zoneCircleMapRef.current.set(zone.id, { circle, marker: centerMarker });
    });

    if (zonesLayer.getLayers().length > 0) {
      map.fitBounds(zonesLayer.getBounds(), { padding: [50, 50], maxZoom: 12 });
    }
  }, [geofences]);

  // Render Trackers relative to Geofences
  useEffect(() => {
    const trackersLayer = trackersLayerRef.current;
    if (!trackersLayer) return;

    trackersLayer.clearLayers();
    if (!showTrackers || trackers.length === 0) return;

    trackers.forEach((tracker) => {
      const trackerHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 22px; height: 22px;">
          <div class="w-4 h-4 rounded-full shadow-md flex items-center justify-center"
               style="background-color: #f59e0b; border: 1.5px solid #ffffff;">
            <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
          </div>
          <div class="absolute -bottom-4 px-1 py-0.5 rounded text-[8px] font-mono bg-background/90 text-foreground border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30">
            ${tracker.device_id}
          </div>
        </div>
      `;

      const trackerIcon = L.divIcon({
        html: trackerHtml,
        className: "custom-mini-tracker-icon",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([tracker.latitude, tracker.longitude], {
        icon: trackerIcon,
      });

      marker.bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 11px;">
          <div style="font-weight: 700; font-family: monospace; color: #f59e0b; margin-bottom: 4px;">
            ${tracker.device_id} (${tracker.meter_id})
          </div>
          <div>Status: <b>${tracker.status}</b></div>
          <div>Battery: <b>${tracker.battery_level}%</b></div>
          <div style="font-size: 9px; opacity: 0.7; margin-top: 4px; font-family: monospace;">
            ${tracker.latitude.toFixed(4)}, ${tracker.longitude.toFixed(4)}
          </div>
        </div>
      `, { className: "custom-tracker-popup" });

      trackersLayer.addLayer(marker);
    });
  }, [trackers, showTrackers]);

  // Fly to selected zone when selectedZoneId changes
  useEffect(() => {
    if (!selectedZoneId || !mapInstanceRef.current) return;
    const target = zoneCircleMapRef.current.get(selectedZoneId);
    const zone = geofences.find((g) => g.id === selectedZoneId);

    if (zone && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([zone.lat, zone.lng], 15, {
        duration: 1.2,
      });

      if (target) {
        setTimeout(() => {
          target.circle.openPopup();
        }, 1200);
      }
    }
  }, [selectedZoneId, geofences]);

  // Reset to all zones bounds
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || !zonesLayerRef.current) return;
    const bounds = zonesLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  };

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
      {/* Header Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/40 bg-card/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Interactive Geofence Map</h3>
              <span className="badge-glass text-primary text-[10px] font-mono px-2 py-0.5">
                {geofences.length} Defined Zones
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Perimeters with real-world radial barriers and breach monitoring
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Tracker Toggle */}
          <button
            onClick={() => setShowTrackers(!showTrackers)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all flex items-center gap-1.5 ${
              showTrackers 
                ? "bg-warning/15 text-warning border-warning/30" 
                : "bg-secondary/40 text-muted-foreground border-border/40 hover:text-foreground"
            }`}
          >
            <Radio className="w-3 h-3" />
            {showTrackers ? "Hide Trackers" : "Show Trackers"}
          </button>

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

          <button
            onClick={handleFitBounds}
            title="Fit All Zones"
            className="glass-card-hover p-2 rounded-lg text-muted-foreground hover:text-foreground border border-border/40 transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="glass-card-hover p-2 rounded-lg text-muted-foreground hover:text-foreground border border-border/40 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Real Map Canvas */}
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

      {/* Legend & Help Footer */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 p-3 border-t border-border/40 bg-card/95 backdrop-blur-md text-[11px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-info"></span>
            <span className="text-muted-foreground">Warehouse Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
            <span className="text-muted-foreground">Installation Site</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse"></span>
            <span className="text-muted-foreground">Restricted Zone</span>
          </div>
        </div>

        <div className="text-muted-foreground">
          Tip: Click any zone card above to fly directly to it on the map
        </div>
      </div>
    </div>
  );
}
