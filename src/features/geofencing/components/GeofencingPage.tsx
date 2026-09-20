import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/features/dashboard";
import { storage } from "@/shared/services/storage.service";
import { mockTrackers } from "@/data/mockData";
import { 
  Shield,
  Plus,
  MapPin,
  Radio,
  AlertTriangle,
  Trash2,
  Navigation,
  Check,
  ExternalLink
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

const typeColors = {
  warehouse: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30', badge: 'bg-info/15 text-info border-info/30' },
  site: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30', badge: 'bg-success/15 text-success border-success/30' },
  restricted: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30', badge: 'bg-destructive/15 text-destructive border-destructive/30' },
};

const Geofencing = () => {
  const navigate = useNavigate();
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  // New Zone Form State
  const [newZone, setNewZone] = useState({
    name: "",
    type: "warehouse",
    lat: "28.6139",
    lng: "77.2090",
    radius: "300",
    alert_type: "both",
  });

  useEffect(() => {
    const loadedGeofences = storage.getGeofences();
    setGeofences(loadedGeofences);

    const loadedTrackers = storage.getTrackers();
    if (loadedTrackers.length > 0) {
      setTrackers(loadedTrackers);
    } else {
      setTrackers(mockTrackers as Tracker[]);
    }
  }, []);

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
  };

  const handleDeleteZone = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this geofence zone?")) {
      storage.deleteGeofence(id);
      const updated = geofences.filter((g) => g.id !== id);
      setGeofences(updated);
      if (selectedZoneId === id) setSelectedZoneId(null);
    }
  };

  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZone.name) return;

    const createdZone: Geofence = {
      id: crypto.randomUUID(),
      name: newZone.name,
      type: newZone.type,
      lat: parseFloat(newZone.lat) || 28.6139,
      lng: parseFloat(newZone.lng) || 77.2090,
      radius: parseInt(newZone.radius, 10) || 300,
      alert_type: newZone.alert_type,
      created_by: null,
      created_at: new Date().toISOString(),
      tracker_count: 0,
    };

    storage.addGeofence(createdZone);
    const updated = [...geofences, createdZone];
    setGeofences(updated);
    setSelectedZoneId(createdZone.id);
    setIsAddDialogOpen(false);

    // Reset form
    setNewZone({
      name: "",
      type: "warehouse",
      lat: "28.6139",
      lng: "77.2090",
      radius: "300",
      alert_type: "both",
    });
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
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="btn-glow px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Zone
          </button>
        </div>

        {/* Real-World Geofence Map */}
        <GeofenceMapView
          geofences={geofences}
          trackers={trackers}
          selectedZoneId={selectedZoneId}
          onSelectZone={(zone) => setSelectedZoneId(zone.id)}
        />

        {/* Geofence Zone Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Active Geofence Perimeters ({geofences.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              Click any card to fly to that zone on the map
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {geofences.map((zone) => {
              const colors = typeColors[zone.type as keyof typeof typeColors] || typeColors.warehouse;
              const isSelected = selectedZoneId === zone.id;

              return (
                <div
                  key={zone.id}
                  onClick={() => handleSelectZone(zone.id)}
                  className={`glass-card-hover p-4 cursor-pointer rounded-2xl transition-all border ${
                    isSelected 
                      ? "ring-2 ring-primary border-primary bg-primary/5 shadow-lg transform -translate-y-0.5" 
                      : colors.border
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center border ${colors.border}`}>
                        {zone.type === "warehouse" ? (
                          <MapPin className={`w-4 h-4 ${colors.text}`} />
                        ) : zone.type === "restricted" ? (
                          <AlertTriangle className={`w-4 h-4 ${colors.text}`} />
                        ) : (
                          <Shield className={`w-4 h-4 ${colors.text}`} />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{zone.name}</h3>
                        <span className={`badge-glass text-[9px] font-bold ${colors.badge} mt-1 uppercase`}>
                          {zone.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/geofencing/${zone.id}`);
                        }}
                        title="View Perimeter Details"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteZone(zone.id, e)}
                        title="Delete Geofence"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-1 border-t border-border/30">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Perimeter Radius</span>
                      <span className="font-semibold text-foreground">{zone.radius} meters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Alert Trigger</span>
                      <span className="text-foreground font-medium capitalize">{zone.alert_type} Alert</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Center GPS</span>
                      <span className="font-mono text-foreground">{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</span>
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
                Define a real-world GPS circular boundary for monitoring vehicle and asset movements.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateZone} className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Delhi Dispatch Terminal"
                  value={newZone.name}
                  onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
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
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  >
                    <option value="warehouse">Warehouse</option>
                    <option value="site">Installation Site</option>
                    <option value="restricted">Restricted Area</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Radius (Meters)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    required
                    value={newZone.radius}
                    onChange={(e) => setNewZone({ ...newZone, radius: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Center Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newZone.lat}
                    onChange={(e) => setNewZone({ ...newZone, lat: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Center Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={newZone.lng}
                    onChange={(e) => setNewZone({ ...newZone, lng: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary text-foreground font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Alert Trigger Condition
                </label>
                <select
                  value={newZone.alert_type}
                  onChange={(e) => setNewZone({ ...newZone, alert_type: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-secondary/40 border border-border/60 focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="both">Both (Entry & Exit)</option>
                  <option value="entry">Entry Alert Only</option>
                  <option value="exit">Exit Alert Only</option>
                </select>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border/60 hover:bg-secondary/40 text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-glow px-4 py-2 rounded-xl text-xs font-medium transition-all"
                >
                  Save & Plot on Map
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
