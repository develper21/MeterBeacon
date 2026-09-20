import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/features/dashboard";
import { geofenceService } from "@/shared/services/geofence.service";
import { trackerService } from "@/shared/services/tracker.service";
import { 
  Shield,
  Plus,
  MapPin,
  Radio,
  Trash2,
  Navigation,
  Loader2,
  RefreshCw
} from "lucide-react";
import type { Geofence, Tracker } from "@/shared/types";
import { GeofenceMapView } from "./GeofenceMapView";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/hooks/use-toast";

const typeColors = {
  warehouse: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30', badge: 'bg-info/15 text-info border-info/30' },
  site: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', badge: 'bg-success/15 text-success border-success/30' },
  restricted: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', badge: 'bg-destructive/15 text-destructive border-destructive/30' },
};

const Geofencing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);

  // New Zone Form State
  const [newZone, setNewZone] = useState({
    name: "",
    type: "warehouse",
    lat: "28.6139",
    lng: "77.2090",
    radius: "300",
    alert_type: "both",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [loadedGeofences, loadedTrackers] = await Promise.all([
        geofenceService.getGeofences(),
        trackerService.getTrackers(),
      ]);
      setGeofences(loadedGeofences);
      setTrackers(loadedTrackers);
    } catch {
      setGeofences([]);
      setTrackers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectZone = (zoneOrId: Geofence | string) => {
    const id = typeof zoneOrId === "string" ? zoneOrId : zoneOrId.id;
    setSelectedZoneId(id);
  };

  const handleDeleteZone = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this geofence zone?")) {
      try {
        await geofenceService.deleteGeofence(id);
        setGeofences((prev) => prev.filter((g) => g.id !== id));
        if (selectedZoneId === id) setSelectedZoneId(null);
        toast({
          title: "Geofence Deleted",
          description: "Perimeter removed from active database monitoring.",
        });
      } catch (err: any) {
        toast({
          title: "Delete Failed",
          description: err.message || "Failed to delete geofence",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name) return;

    setSubmitting(true);
    try {
      const created = await geofenceService.createGeofence({
        name: newZone.name.trim(),
        type: newZone.type,
        lat: parseFloat(newZone.lat) || 28.6139,
        lng: parseFloat(newZone.lng) || 77.2090,
        radius: parseInt(newZone.radius, 10) || 300,
        alert_type: newZone.alert_type,
      });

      setGeofences((prev) => [created, ...prev]);
      setSelectedZoneId(created.id);
      setIsAddDialogOpen(false);
      toast({
        title: "Geofence Created",
        description: `Zone "${created.name}" is now active and watching for breaches.`,
      });

      // Reset form
      setNewZone({
        name: "",
        type: "warehouse",
        lat: "28.6139",
        lng: "77.2090",
        radius: "300",
        alert_type: "both",
      });
    } catch (err: any) {
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to create geofence",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Geofencing Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Define perimeter barriers, monitor real-world breach alerts, and inspect active device counts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              title="Refresh Geofences"
              className="p-2.5 rounded-xl glass-card-hover text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>
            <button 
              onClick={() => setIsAddDialogOpen(true)}
              className="btn-glow px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Zone
            </button>
          </div>
        </div>

        {/* Live Interactive Leaflet Map */}
        <div className="glass-card p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Live Geofence Perimeter Map (Delhi NCR)</h2>
            </div>
            <span className="badge-glass text-[11px] text-muted-foreground font-mono">
              {geofences.length} Active Zones &bull; {trackers.length} Live Trackers
            </span>
          </div>
          <GeofenceMapView 
            geofences={geofences} 
            trackers={trackers} 
            selectedZoneId={selectedZoneId}
            onSelectZone={handleSelectZone}
          />
        </div>

        {/* Zones Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Active Perimeter Definitions</h2>
            <span className="text-xs text-muted-foreground font-medium">
              Click any perimeter card to focus on map or view its telemetry details
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center glass-card rounded-2xl">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading geofence perimeters from backend...</p>
            </div>
          ) : geofences.length === 0 ? (
            <div className="p-16 text-center glass-card rounded-2xl">
              <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No active geofences configured</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-5">
                Define virtual GPS zones around warehouses, installation sites, or restricted transit corridors to trigger automated breach alerts.
              </p>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="btn-glow px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create First Zone
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geofences.map((zone) => {
                const colors = (typeColors as any)[zone.type] || typeColors.warehouse;
                const isSelected = selectedZoneId === zone.id;

                return (
                  <div
                    key={zone.id}
                    onClick={() => handleSelectZone(zone.id)}
                    className={`glass-card p-5 rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                      isSelected 
                        ? 'ring-2 ring-primary shadow-lg shadow-primary/10 border-primary/40 bg-card/90' 
                        : 'hover:border-primary/40 hover:bg-card/70'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${colors.bg} ${colors.text} border ${colors.border}`}>
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {zone.name}
                          </h3>
                          <span className={`inline-block px-2 py-0.5 mt-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${colors.badge}`}>
                            {zone.type}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteZone(zone.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        title="Delete Zone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs pt-2 border-t border-border/30">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Coordinates
                        </span>
                        <span className="font-mono text-foreground font-medium">
                          {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Navigation className="w-3.5 h-3.5" /> Radius
                        </span>
                        <span className="font-mono text-foreground font-medium">{zone.radius} meters</span>
                      </div>

                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Trigger Alert</span>
                        <span className="font-semibold text-foreground capitalize">{zone.alert_type}</span>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-border/20">
                        <span className="text-muted-foreground">Trackers Inside</span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                          <Radio className="w-3 h-3 text-primary animate-pulse" />
                          <span className="font-bold text-primary">{zone.tracker_count ?? 0}</span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-border/20 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectZone(zone.id);
                          }}
                          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium"
                        >
                          Focus on Map
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/geofencing/${zone.id}`);
                          }}
                          className="text-[11px] text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                          View Details &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Zone Dialog Modal */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[480px] glass-card border-border/60">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Add New Geofence Zone
              </DialogTitle>
              <DialogDescription>
                Define a real-world GPS circular boundary saved into PostgreSQL for monitoring asset movements.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateZone} className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Zone Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Delhi Dispatch Terminal"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="glass-input w-full text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Zone Type
                  </label>
                  <select
                    value={newZone.type}
                    onChange={(e) => setNewZone({ ...newZone, type: e.target.value })}
                    className="glass-input w-full text-sm bg-background"
                  >
                    <option value="warehouse">Warehouse</option>
                    <option value="site">Installation Site</option>
                    <option value="restricted">Restricted Zone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Radius (Meters) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="10000"
                    step="50"
                    required
                    value={newZone.radius}
                    onChange={(e) => setNewZone({ ...newZone, radius: e.target.value })}
                    className="glass-input w-full text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Center Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newZone.lat}
                    onChange={(e) => setNewZone({ ...newZone, lat: e.target.value })}
                    className="glass-input w-full text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Center Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newZone.lng}
                    onChange={(e) => setNewZone({ ...newZone, lng: e.target.value })}
                    className="glass-input w-full text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Breach Alert Notification
                </label>
                <select
                  value={newZone.alert_type}
                  onChange={(e) => setNewZone({ ...newZone, alert_type: e.target.value })}
                  className="glass-input w-full text-sm bg-background"
                >
                  <option value="both">Both Entry & Exit Events</option>
                  <option value="entry">Entry Only</option>
                  <option value="exit">Exit Only</option>
                </select>
              </div>

              <DialogFooter className="pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-glow px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Perimeter
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Geofencing;
