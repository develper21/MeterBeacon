import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/features/dashboard";
import { storage } from "@/shared/services/storage.service";
import { mockGeofences, mockTrackers, statusConfig } from "@/data/mockData";
import type { Geofence, Tracker } from "@/shared/types";
import L from "leaflet";
import {
  ArrowLeft,
  Shield,
  MapPin,
  AlertTriangle,
  Radio,
  Clock,
  Trash2,
  Edit,
  Download,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  Users,
  Compass,
} from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";

type TileTheme = "streets" | "dark" | "satellite";

const TILE_LAYERS: Record<TileTheme, { url: string; attribution: string; subdomains?: string }> = {
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: "abc",
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; Esri &mdash; Earthstar Geographics',
  },
};

const ZONE_STYLES: Record<string, { color: string; fill: string; border: string }> = {
  warehouse: { color: "#3b82f6", fill: "rgba(59, 130, 246, 0.22)", border: "#60a5fa" },
  site: { color: "#10b981", fill: "rgba(16, 185, 129, 0.22)", border: "#34d399" },
  restricted: { color: "#ef4444", fill: "rgba(239, 68, 68, 0.25)", border: "#f87171" },
};

// Calculate distance in meters between two lat/lng points
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function GeofenceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [geofence, setGeofence] = useState<Geofence | null>(null);
  const [trackersInside, setTrackersInside] = useState<Tracker[]>([]);
  const [copied, setCopied] = useState(false);
  const [tileTheme, setTileTheme] = useState<TileTheme>("streets");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRadius, setEditRadius] = useState("500");
  const [editAlertType, setEditAlertType] = useState("both");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Load geofence & trackers inside
  useEffect(() => {
    const allGeofences = storage.getGeofences();
    let found = allGeofences.find((g) => g.id === id);

    if (!found) {
      const mockFound = mockGeofences.find((g) => g.id === id);
      if (mockFound) {
        found = {
          ...mockFound,
          created_by: null,
          created_at: new Date().toISOString(),
        } as Geofence;
      }
    }

    if (found) {
      setGeofence(found);
      setEditRadius(found.radius.toString());
      setEditAlertType(found.alert_type);

      // Identify trackers currently inside or matching
      const allTrackers = storage.getTrackers().length > 0 ? storage.getTrackers() : (mockTrackers as Tracker[]);
      const inside = allTrackers.filter((t) => {
        const dist = getDistanceMeters(found!.lat, found!.lng, t.latitude, t.longitude);
        return dist <= found!.radius * 1.5; // Within or immediately at perimeter
      });
      setTrackersInside(inside);
    }
  }, [id]);

  const handleCopyGps = () => {
    if (!geofence) return;
    navigator.clipboard.writeText(`${geofence.lat.toFixed(5)}, ${geofence.lng.toFixed(5)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportGeoJson = () => {
    if (!geofence) return;
    const geoJson = {
      type: "Feature",
      properties: {
        id: geofence.id,
        name: geofence.name,
        type: geofence.type,
        radius_meters: geofence.radius,
        alert_type: geofence.alert_type,
      },
      geometry: {
        type: "Point",
        coordinates: [geofence.lng, geofence.lat],
      },
    };

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${geofence.name.toLowerCase().replace(/\s+/g, "_")}_geofence.geojson`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "GeoJSON Exported",
      description: `Perimeter definition for ${geofence.name} downloaded successfully.`,
    });
  };

  const handleDelete = () => {
    if (!geofence) return;
    if (confirm(`Are you sure you want to delete geofence "${geofence.name}"?`)) {
      storage.deleteGeofence(geofence.id);
      toast({
        title: "Perimeter Deleted",
        description: `${geofence.name} has been removed from active geofences.`,
      });
      navigate("/geofencing");
    }
  };

  const handleSaveEdit = () => {
    if (!geofence) return;
    const newRad = parseInt(editRadius, 10) || 500;
    storage.updateGeofence(geofence.id, { radius: newRad, alert_type: editAlertType });
    setGeofence({ ...geofence, radius: newRad, alert_type: editAlertType });
    setIsEditDialogOpen(false);
    toast({
      title: "Perimeter Updated",
      description: `Radius updated to ${newRad}m with ${editAlertType} alert mode.`,
    });
  };

  // Leaflet Map Init
  useEffect(() => {
    if (!geofence || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [geofence.lat, geofence.lng],
      zoom: 15,
      minZoom: 11,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const tileConfig = TILE_LAYERS[tileTheme];
    const tileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      subdomains: tileConfig.subdomains || "abc",
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const style = ZONE_STYLES[geofence.type] || ZONE_STYLES.warehouse;
    const isRestricted = geofence.type === "restricted";

    // Circle Overlay
    const circle = L.circle([geofence.lat, geofence.lng], {
      radius: geofence.radius,
      color: style.color,
      fillColor: style.color,
      fillOpacity: 0.22,
      weight: isRestricted ? 3.5 : 2.5,
      dashArray: isRestricted ? "8, 6" : undefined,
    }).addTo(map);

    // Center Radar Marker
    const centerHtml = `
      <div class="relative flex items-center justify-center cursor-pointer" style="width: 40px; height: 40px;">
        <div class="absolute inset-0 rounded-full animate-marker-radar pointer-events-none" 
             style="background-color: ${style.color}; opacity: 0.45;"></div>
        <div class="w-8 h-8 rounded-full shadow-2xl flex items-center justify-center"
             style="background-color: ${style.color}; border: 3px solid #ffffff; box-shadow: 0 0 16px ${style.color}aa;">
          <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
        </div>
      </div>
    `;

    const centerIcon = L.divIcon({
      html: centerHtml,
      className: "custom-zone-center-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
    });

    L.marker([geofence.lat, geofence.lng], { icon: centerIcon })
      .bindPopup(`
        <div style="padding: 10px; font-family: inherit; font-size: 11px;">
          <div style="font-weight: 700; color: ${style.color}; font-size: 12px;">${geofence.name}</div>
          <div>Radius: <b>${geofence.radius}m</b></div>
          <div>Alert Mode: <b>${geofence.alert_type}</b></div>
        </div>
      `, { className: "custom-tracker-popup" })
      .addTo(map)
      .openPopup();

    // Plot live trackers inside or near this zone
    trackersInside.forEach((tr) => {
      const dist = Math.round(getDistanceMeters(geofence.lat, geofence.lng, tr.latitude, tr.longitude));
      const trHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" style="width: 32px; height: 32px;">
          <div class="w-7 h-7 rounded-full shadow-md flex items-center justify-center"
               style="background-color: #f59e0b; border: 2px solid #ffffff;">
            <span style="font-size: 9px; font-weight: 800; color: #ffffff; font-family: monospace;">
              ${tr.device_id.replace("TRK-", "")}
            </span>
          </div>
        </div>
      `;

      const trIcon = L.divIcon({
        html: trHtml,
        className: "custom-mini-tracker-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });

      L.marker([tr.latitude, tr.longitude], { icon: trIcon })
        .bindPopup(`
          <div style="padding: 10px; font-family: inherit; font-size: 11px;">
            <div style="font-weight: 700; font-family: monospace; color: #f59e0b;">${tr.device_id}</div>
            <div>Status: <b>${statusConfig[tr.status]?.label || tr.status}</b></div>
            <div>Distance to Center: <b>${dist}m</b></div>
            <div>Battery: <b>${tr.battery_level}%</b></div>
          </div>
        `, { className: "custom-tracker-popup" })
        .addTo(map);
    });

    mapInstanceRef.current = map;

    const handleResize = () => map.invalidateSize();
    window.addEventListener("resize", handleResize);
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 350);

    return () => {
      window.removeEventListener("resize", handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [geofence, trackersInside]);

  // Tile theme change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (tileLayerRef.current) map.removeLayer(tileLayerRef.current);

    const config = TILE_LAYERS[tileTheme];
    const newLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      subdomains: config.subdomains || "abc",
      maxZoom: 19,
      crossOrigin: true,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [tileTheme]);

  if (!geofence) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Geofence Perimeter Not Found</h2>
          <p className="text-sm text-muted-foreground">The requested zone boundary could not be loaded.</p>
          <button onClick={() => navigate("/geofencing")} className="btn-glow px-4 py-2 rounded-xl text-xs font-medium">
            Return to Geofencing
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const style = ZONE_STYLES[geofence.type] || ZONE_STYLES.warehouse;
  const areaKm2 = ((Math.PI * Math.pow(geofence.radius, 2)) / 1000000).toFixed(2);
  const perimeterKm = ((2 * Math.PI * geofence.radius) / 1000).toFixed(2);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header Breadcrumbs & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/geofencing")}
              className="p-2 rounded-xl glass-card-hover text-muted-foreground hover:text-foreground border border-border/40 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link to="/geofencing" className="hover:text-primary transition-colors">Geofencing</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium">{geofence.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl font-bold text-foreground tracking-tight">
                  {geofence.name}
                </h1>
                <span className="badge-glass text-[10px] font-bold uppercase tracking-wider px-2.5 py-1" style={{ color: style.color, backgroundColor: style.fill }}>
                  {geofence.type}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyGps}
              className="glass-card-hover px-3 py-2 rounded-xl text-xs font-medium text-foreground border border-border/40 flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy GPS"}
            </button>

            <button
              onClick={handleExportGeoJson}
              className="glass-card-hover px-3 py-2 rounded-xl text-xs font-medium text-foreground border border-border/40 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              GeoJSON
            </button>

            <button
              onClick={() => setIsEditDialogOpen(true)}
              className="glass-card-hover px-3 py-2 rounded-xl text-xs font-medium text-primary border border-primary/30 flex items-center gap-1.5 transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Perimeter
            </button>

            <button
              onClick={handleDelete}
              className="p-2 rounded-xl text-destructive hover:bg-destructive/10 border border-destructive/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Perimeter Metrics KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-1.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-primary" /> Perimeter Radius
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-foreground" style={{ color: style.color }}>
                {geofence.radius}
              </span>
              <span className="text-xs text-muted-foreground">meters</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono">Circumference: {perimeterKm} km</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-1.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" /> Trackers Inside
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-foreground">
                {trackersInside.length}
              </span>
              <span className="text-xs text-muted-foreground">units monitored</span>
            </div>
            <p className="text-[10px] text-success font-medium">All telemetry active</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-1.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-primary" /> Alert Trigger
            </span>
            <p className="text-lg font-bold text-foreground capitalize">
              {geofence.alert_type} Breach
            </p>
            <p className="text-[10px] text-muted-foreground">SMS & push notification</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-1.5">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" /> Center Point
            </span>
            <p className="text-sm font-bold font-mono text-foreground">
              {geofence.lat.toFixed(4)}, {geofence.lng.toFixed(4)}
            </p>
            <p className="text-[10px] text-muted-foreground">Area: {areaKm2} km&sup2;</p>
          </div>
        </div>

        {/* Real-World High-Definition Geofence Map */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border/50 shadow-sm flex flex-col">
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/40 bg-card/95 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">High-Definition Perimeter View</h3>
              <span className="badge-glass text-primary text-[10px] font-mono px-2 py-0.5">
                {geofence.radius}m Radial Barrier
              </span>
            </div>

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
          </div>

          <div
            className="w-full relative z-10 overflow-hidden bg-muted/10"
            style={{ height: "450px", minHeight: "450px" }}
          >
            <div
              ref={mapContainerRef}
              className="w-full h-full"
              style={{ width: "100%", height: "100%", minHeight: "100%" }}
            />
          </div>

          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-3 border-t border-border/40 bg-card/95 backdrop-blur-md text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.color }} />
                <span>Geofence Center & Circular Boundary</span>
              </span>
              <span>&bull;</span>
              <span>Amber markers: Smart meters currently within perimeter</span>
            </div>
            <span>Trigger mode: {geofence.alert_type} breach</span>
          </div>
        </div>

        {/* Trackers Currently Inside Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border/40">
          <div className="flex items-center justify-between p-4 border-b border-border/40 bg-card/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Radio className="w-4 h-4 text-primary" />
              Smart Meters Currently Within Perimeter ({trackersInside.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              Click any device to view individual telemetry details
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                  <th className="text-left py-3 px-4">Device ID</th>
                  <th className="text-left py-3 px-4">Meter ID</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Battery</th>
                  <th className="text-left py-3 px-4">Distance to Center</th>
                  <th className="text-left py-3 px-4">Assigned Engineer</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {trackersInside.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                      No trackers currently detected inside this geofence perimeter.
                    </td>
                  </tr>
                ) : (
                  trackersInside.map((t) => {
                    const dist = Math.round(getDistanceMeters(geofence.lat, geofence.lng, t.latitude, t.longitude));
                    const cfg = statusConfig[t.status] || { label: t.status, dotClass: "" };
                    return (
                      <tr key={t.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-foreground text-primary">{t.device_id}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">{t.meter_id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className={cfg.dotClass} />
                            <span>{cfg.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono font-bold ${
                            t.battery_level < 20 ? "text-destructive" : t.battery_level < 50 ? "text-warning" : "text-success"
                          }`}>
                            {t.battery_level}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-foreground font-semibold">{dist}m</td>
                        <td className="py-3 px-4 text-muted-foreground">{t.assigned_to || "—"}</td>
                        <td className="py-3 px-4">
                          <Link
                            to={`/trackers/${t.id}`}
                            className="text-primary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                          >
                            Details <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Perimeter Breach & Incident Log */}
        <div className="glass-card p-5 rounded-2xl border border-border/40 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Perimeter Activity & Breach Log
          </h3>

          <div className="space-y-2 text-xs">
            {[
              { time: "Today 10:20 AM", event: "Tracker TRK-006 exited boundary (Breach Alert Triggered)", type: "exit", severity: "warning" },
              { time: "Today 09:15 AM", event: "Tracker TRK-003 entered boundary safely (Digital Handshake verified)", type: "entry", severity: "success" },
              { time: "Yesterday 05:40 PM", event: "Automated perimeter security audit scan completed (All bounds verified)", type: "audit", severity: "info" },
            ].map((log, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${
                    log.severity === "warning" ? "bg-warning animate-pulse" : log.severity === "success" ? "bg-success" : "bg-info"
                  }`} />
                  <span className="text-foreground">{log.event}</span>
                </div>
                <span className="text-muted-foreground font-mono text-[11px] shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Perimeter Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[420px] glass-card border-border/60">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-primary" />
                Edit Perimeter: {geofence.name}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div>
                <label className="font-semibold text-foreground block mb-1">Perimeter Radius (Meters):</label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  value={editRadius}
                  onChange={(e) => setEditRadius(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary/40 border border-border/60 text-foreground"
                />
              </div>

              <div>
                <label className="font-semibold text-foreground block mb-1">Alert Trigger Rule:</label>
                <select
                  value={editAlertType}
                  onChange={(e) => setEditAlertType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary/40 border border-border/60 text-foreground"
                >
                  <option value="both">Both (Entry & Exit)</option>
                  <option value="entry">Entry Only</option>
                  <option value="exit">Exit Only</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setIsEditDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border/60 hover:bg-secondary/40 text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="btn-glow px-4 py-2 rounded-xl text-xs font-medium"
              >
                Save Changes
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
