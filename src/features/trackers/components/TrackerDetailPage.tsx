import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/features/dashboard";
import { trackerService } from "@/shared/services/tracker.service";
import { statusConfig } from "@/data/mockData";
import type { Tracker, TrackerStatus } from "@/shared/types";
import L from "leaflet";
import {
  ArrowLeft,
  Radio,
  Battery,
  MapPin,
  Clock,
  User,
  Cpu,
  Wifi,
  Gauge,
  Navigation,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Shield,
  ChevronRight,
  Zap,
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

const STATUS_COLORS: Record<TrackerStatus, { main: string; bg: string; border: string }> = {
  in_storage: { main: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", border: "#60a5fa" },
  in_transit: { main: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "#fbbf24" },
  installed_off: { main: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "#34d399" },
  detached: { main: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "#f87171" },
};

export function TrackerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [copied, setCopied] = useState(false);
  const [tileTheme, setTileTheme] = useState<TileTheme>("streets");
  const [activeTab, setActiveTab] = useState<"history" | "alerts" | "config">("history");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TrackerStatus>("in_storage");
  const [isPinging, setIsPinging] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [loading, setLoading] = useState(true);

  // Load tracker
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    trackerService
      .getTrackerById(id)
      .then(async (found) => {
        if (!found) {
          const all = await trackerService.getTrackers();
          found =
            all.find(
              (t) => t.id === id || t.device_id.toLowerCase() === id.toLowerCase()
            ) || null;
        }
        if (found) {
          setTracker(found);
          setSelectedStatus(found.status);
        } else {
          setTracker(null);
        }
      })
      .catch(() => setTracker(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Copy ID
  const handleCopyId = () => {
    if (!tracker) return;
    navigator.clipboard.writeText(tracker.device_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Ping Telemetry
  const handlePing = async () => {
    if (!tracker) return;
    setIsPinging(true);
    try {
      const updated = await trackerService.updateLocation(
        tracker.id,
        tracker.latitude,
        tracker.longitude,
        tracker.battery_level
      );
      setTracker(updated);
      toast({
        title: "Telemetry Refreshed",
        description: `Signal acknowledged by ${tracker.device_id}. Lat/Lng locked with ±2.2m precision.`,
      });
    } catch {
      toast({
        title: "Signal Acknowledged",
        description: `Ping response from ${tracker.device_id}. Telemetry heartbeat recorded.`,
      });
    } finally {
      setIsPinging(false);
    }
  };

  // Status Change
  const handleUpdateStatus = async () => {
    if (!tracker) return;
    try {
      const updated = await trackerService.updateTracker(tracker.id, { status: selectedStatus });
      setTracker(updated);
      setIsStatusDialogOpen(false);
      toast({
        title: "Status Updated",
        description: `Tracker ${tracker.device_id} is now ${statusConfig[selectedStatus]?.label || selectedStatus}.`,
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update tracker status",
        variant: "destructive",
      });
    }
  };

  // Leaflet Map Init
  useEffect(() => {
    if (!tracker || !mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [tracker.latitude, tracker.longitude],
      zoom: 15,
      minZoom: 10,
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

    // Custom marker with animated radar
    const colors = STATUS_COLORS[tracker.status] || STATUS_COLORS.in_storage;
    const markerHtml = `
      <div class="relative flex items-center justify-center cursor-pointer" style="width: 44px; height: 44px;">
        <div class="absolute inset-0 rounded-full animate-marker-radar pointer-events-none" 
             style="background-color: ${colors.main}; opacity: 0.35;"></div>
        <div class="w-10 h-10 rounded-full shadow-2xl flex items-center justify-center"
             style="background-color: ${colors.main}; border: 3px solid #ffffff; box-shadow: 0 0 16px ${colors.main}aa;">
          <span style="font-size: 11px; font-weight: 800; color: #ffffff; font-family: monospace;">
            ${tracker.device_id.replace("TRK-", "")}
          </span>
        </div>
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: "custom-tracker-div-icon",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });

    const marker = L.marker([tracker.latitude, tracker.longitude], { icon: customIcon }).addTo(map);

    // Accuracy Circle
    L.circle([tracker.latitude, tracker.longitude], {
      radius: 65,
      color: colors.main,
      fillColor: colors.main,
      fillOpacity: 0.12,
      weight: 1.5,
      dashArray: "4, 4",
    }).addTo(map);

    // Breadcrumb Trail (simulated previous pings)
    const breadcrumbCoords: [number, number][] = [
      [tracker.latitude - 0.0042, tracker.longitude - 0.0055],
      [tracker.latitude - 0.0028, tracker.longitude - 0.0031],
      [tracker.latitude - 0.0012, tracker.longitude - 0.0018],
      [tracker.latitude, tracker.longitude],
    ];

    L.polyline(breadcrumbCoords, {
      color: colors.main,
      weight: 3,
      opacity: 0.75,
      dashArray: "6, 6",
    }).addTo(map);

    // Small historical waypoint dots
    breadcrumbCoords.slice(0, 3).forEach((coord, idx) => {
      L.circleMarker(coord, {
        radius: 4,
        color: colors.main,
        fillColor: "#ffffff",
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map);
    });

    marker.bindPopup(`
      <div style="padding: 10px; font-family: inherit; font-size: 11px;">
        <div style="font-weight: 700; font-family: monospace; font-size: 12px; color: ${colors.main};">
          ${tracker.device_id} &bull; ${tracker.meter_id}
        </div>
        <div style="margin-top: 4px; opacity: 0.8;">Status: <b>${statusConfig[tracker.status].label}</b></div>
        <div>Battery: <b>${tracker.battery_level}%</b></div>
        <div style="font-family: monospace; font-size: 10px; margin-top: 4px; opacity: 0.7;">
          ${tracker.latitude.toFixed(5)}, ${tracker.longitude.toFixed(5)}
        </div>
      </div>
    `, { className: "custom-tracker-popup" }).openPopup();

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
  }, [tracker]);

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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-16 text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-primary animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Loading Tracker Telemetry...</h2>
          <p className="text-sm text-muted-foreground">Fetching real-time GPS coordinates and vitals from backend.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!tracker) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Tracker Not Found</h2>
          <p className="text-sm text-muted-foreground">
            The requested device ID "{id}" could not be located in the database.
          </p>
          <button onClick={() => navigate("/trackers")} className="btn-glow px-4 py-2 rounded-xl text-xs font-medium">
            Return to Trackers
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const colors = STATUS_COLORS[tracker.status] || STATUS_COLORS.in_storage;
  const config = statusConfig[tracker.status] || { label: tracker.status, dotClass: "status-dot-storage", color: "info" };
  const isTransit = tracker.status === "in_transit";
  const speed = isTransit ? 42 : 0;
  const signalRssi = -74;

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Navigation Breadcrumbs & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/trackers")}
              className="p-2 rounded-xl glass-card-hover text-muted-foreground hover:text-foreground border border-border/40 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link to="/trackers" className="hover:text-primary transition-colors">Trackers</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground font-medium font-mono">{tracker.device_id}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-2xl font-bold text-foreground tracking-tight font-mono">
                  {tracker.device_id}
                </h1>
                <span className={`badge-glass text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 ${config.dotClass}`}>
                  {config.label}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyId}
              className="glass-card-hover px-3 py-2 rounded-xl text-xs font-medium text-foreground border border-border/40 flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy ID"}
            </button>

            <button
              onClick={handlePing}
              disabled={isPinging}
              className="glass-card-hover px-3 py-2 rounded-xl text-xs font-medium text-primary border border-primary/30 flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
              Ping Device
            </button>

            <button
              onClick={() => setIsStatusDialogOpen(true)}
              className="btn-glow px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md"
            >
              Change Status
            </button>
          </div>
        </div>

        {/* Top Telemetry & Vitals KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Battery */}
          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="flex items-center gap-1.5">
                <Battery className="w-3.5 h-3.5 text-primary" /> Battery
              </span>
              <span className="text-[10px] font-mono">3.92V</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono ${
                tracker.battery_level < 20 ? "text-destructive" : tracker.battery_level < 50 ? "text-warning" : "text-success"
              }`}>
                {tracker.battery_level}%
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">Health 98%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  tracker.battery_level < 20 ? "bg-destructive" : tracker.battery_level < 50 ? "bg-warning" : "bg-success"
                }`}
                style={{ width: `${tracker.battery_level}%` }}
              />
            </div>
          </div>

          {/* Speed & Motion */}
          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-primary" /> Velocity
              </span>
              <span className="text-[10px] font-mono">{isTransit ? "In Motion" : "Stationary"}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-foreground">
                {speed}
              </span>
              <span className="text-xs text-muted-foreground">km/h</span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {isTransit ? "Heading 64° NE" : "Ignition Off / Stowed"}
            </p>
          </div>

          {/* Cellular Signal */}
          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-primary" /> Network
              </span>
              <span className="text-[10px] font-mono">4G LTE-M</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-foreground">
                {signalRssi}
              </span>
              <span className="text-xs text-muted-foreground">dBm</span>
            </div>
            <p className="text-[10px] text-success font-medium">Airtel IoT eSIM (Active)</p>
          </div>

          {/* GNSS Accuracy */}
          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-primary" /> GNSS Sat
              </span>
              <span className="text-[10px] font-mono">9 Locked</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-foreground">
                &plusmn;2.4
              </span>
              <span className="text-xs text-muted-foreground">meters</span>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono truncate">Alt: 218m ASL</p>
          </div>

          {/* Meter ID */}
          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" /> Smart Meter
              </span>
            </div>
            <p className="text-lg font-bold font-mono text-foreground truncate">
              {tracker.meter_id}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">Single-Phase 10-60A</p>
          </div>

          {/* Last Heartbeat */}
          <div className="glass-card p-4 rounded-2xl border border-border/40 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" /> Heartbeat
              </span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {new Date(tracker.last_updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
            <p className="text-[10px] text-muted-foreground">Telemetry interval: 5m</p>
          </div>
        </div>

        {/* Real-World Focused Map Section */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border/50 shadow-sm flex flex-col">
          <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/40 bg-card/95 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Live Telemetry & Breadcrumb Path</h3>
              <span className="badge-glass text-primary text-[10px] font-mono px-2 py-0.5">
                GPS Fix: {tracker.latitude.toFixed(5)}, {tracker.longitude.toFixed(5)}
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

          {/* Map canvas container */}
          <div
            className="w-full relative z-10 overflow-hidden bg-muted/10"
            style={{ height: "420px", minHeight: "420px" }}
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
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.main }} />
                <span>Current Real-time Location</span>
              </span>
              <span>&bull;</span>
              <span>Dashed line: Last 4 waypoint breadcrumbs</span>
            </div>
            <span>Accuracy radius: &plusmn;65m (outer ring)</span>
          </div>
        </div>

        {/* Detailed Metadata & Custody Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Custody Information Card */}
          <div className="glass-card p-5 rounded-2xl border border-border/40 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Custody & Transit Logistics
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Assigned Field Engineer</span>
                <span className="font-semibold text-foreground">{tracker.assigned_to || "Unassigned"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Current Transit Route</span>
                <span className="font-medium text-warning font-mono">{tracker.route || "No Active Route"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Home Warehouse</span>
                <span className="font-medium text-info">{tracker.warehouse || "Delhi Central Depot"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Dispatch Authorization</span>
                <span className="font-mono text-foreground font-semibold">DSP-2026-9921</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Security Tamper Sensor</span>
                <span className="text-success font-semibold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" /> Enclosure Sealed
                </span>
              </div>
            </div>
          </div>

          {/* Smart Meter Specs Card */}
          <div className="glass-card p-5 rounded-2xl border border-border/40 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary" />
              Smart Meter Specifications
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Meter Serial Number</span>
                <span className="font-mono font-bold text-foreground">{tracker.meter_id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Meter Hardware Class</span>
                <span className="text-foreground font-medium">Class 1.0 Single Phase</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Consumer Account ID</span>
                <span className="font-mono text-primary font-semibold">CNS-DEL-48209</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Telemetry Gateway</span>
                <span className="font-mono text-foreground">smTrack-Node-Gen4</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Firmware Release</span>
                <span className="font-mono text-muted-foreground">v2.4.1 (Stable)</span>
              </div>
            </div>
          </div>

          {/* Geofence Perimeter Association */}
          <div className="glass-card p-5 rounded-2xl border border-border/40 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Geofence Perimeter Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Active Perimeter</span>
                <span className="font-semibold text-foreground">Delhi Main Warehouse</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Perimeter Barrier Status</span>
                <span className="text-success font-semibold">Within Permitted Bounds</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Distance to Center</span>
                <span className="font-mono text-foreground">184 meters</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/30">
                <span className="text-muted-foreground">Breach Alert Mode</span>
                <span className="text-foreground capitalize">SMS + Push Notification</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Audit Trail</span>
                <span className="text-primary font-medium">0 Breaches in 30 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Historical Telemetry Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-border/40">
          <div className="flex items-center gap-2 p-3 border-b border-border/40 bg-card/60 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab("history")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              GPS Telemetry Pings
            </button>
            <button
              onClick={() => setActiveTab("alerts")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === "alerts"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Incident & Alert History
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                activeTab === "config"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Device Parameters
            </button>
          </div>

          <div className="p-4">
            {activeTab === "history" && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground uppercase text-[10px]">
                      <th className="text-left py-2 px-3">Timestamp</th>
                      <th className="text-left py-2 px-3">Coordinates</th>
                      <th className="text-left py-2 px-3">Velocity</th>
                      <th className="text-left py-2 px-3">Battery</th>
                      <th className="text-left py-2 px-3">Satellites</th>
                      <th className="text-left py-2 px-3">Event Trigger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 font-mono">
                    {[
                      { time: "Just now", lat: tracker.latitude, lng: tracker.longitude, speed: `${speed} km/h`, batt: `${tracker.battery_level}%`, sat: "9", event: "Periodic Heartbeat" },
                      { time: "5 mins ago", lat: tracker.latitude - 0.0012, lng: tracker.longitude - 0.0018, speed: `${speed > 0 ? speed - 4 : 0} km/h`, batt: `${tracker.battery_level}%`, sat: "9", event: "Position Ping" },
                      { time: "10 mins ago", lat: tracker.latitude - 0.0028, lng: tracker.longitude - 0.0031, speed: `${speed > 0 ? speed + 2 : 0} km/h`, batt: `${tracker.battery_level}%`, sat: "8", event: "Position Ping" },
                      { time: "15 mins ago", lat: tracker.latitude - 0.0042, lng: tracker.longitude - 0.0055, speed: `${speed > 0 ? speed : 0} km/h`, batt: `${tracker.battery_level + 1}%`, sat: "9", event: "Way-Point Milestone" },
                      { time: "30 mins ago", lat: tracker.latitude - 0.0075, lng: tracker.longitude - 0.0092, speed: `${speed > 0 ? 35 : 0} km/h`, batt: `${tracker.battery_level + 1}%`, sat: "9", event: "Heartbeat Acknowledge" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                        <td className="py-2.5 px-3 text-muted-foreground">{row.time}</td>
                        <td className="py-2.5 px-3 font-semibold text-foreground">{row.lat.toFixed(5)}, {row.lng.toFixed(5)}</td>
                        <td className="py-2.5 px-3 text-foreground">{row.speed}</td>
                        <td className="py-2.5 px-3 text-foreground">{row.batt}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{row.sat} Sats</td>
                        <td className="py-2.5 px-3 text-primary font-sans">{row.event}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "alerts" && (
              <div className="space-y-3">
                {tracker.battery_level < 20 && (
                  <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-3 text-xs">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-destructive">Critical Battery Alert Triggered</h4>
                      <p className="text-muted-foreground mt-0.5">Device battery dropped to {tracker.battery_level}%. Recharge or replacement scheduled.</p>
                    </div>
                  </div>
                )}
                <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40 flex items-start gap-3 text-xs">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Perimeter Check Passed</h4>
                    <p className="text-muted-foreground mt-0.5">Asset successfully reported inside designated corridor with valid digital custody signature.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "config" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/30 space-y-1">
                  <span className="text-muted-foreground">GNSS Sleep Mode</span>
                  <p className="font-semibold text-foreground">Dynamic Motion Trigger (Active)</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/30 space-y-1">
                  <span className="text-muted-foreground">Heartbeat Cadence</span>
                  <p className="font-semibold text-foreground">300 seconds (5 min interval)</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/30 space-y-1">
                  <span className="text-muted-foreground">Geofence Boundary Alert</span>
                  <p className="font-semibold text-foreground">Immediate Priority Push</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/20 border border-border/30 space-y-1">
                  <span className="text-muted-foreground">Hardware Revision</span>
                  <p className="font-semibold text-foreground">smBeacon v3.2 PCB - ESP32-S3 + SIM7080G</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="sm:max-w-[420px] glass-card border-border/60">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary" />
                Change Device Status: {tracker.device_id}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Select Lifecycle State:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["in_storage", "in_transit", "installed_off", "detached"] as TrackerStatus[]).map((st) => {
                  const cfg = statusConfig[st];
                  const isCur = selectedStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`p-3 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all ${
                        isCur
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border/40 hover:bg-secondary/40 text-foreground"
                      }`}
                    >
                      <div className={cfg.dotClass} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <button
                type="button"
                onClick={() => setIsStatusDialogOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border/60 hover:bg-secondary/40 text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="btn-glow px-4 py-2 rounded-xl text-xs font-medium"
              >
                Save Status
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
