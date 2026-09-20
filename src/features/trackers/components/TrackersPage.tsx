import { DashboardLayout } from "@/features/dashboard";
import { statusConfig } from "@/data/mockData";
import { trackerService } from "@/shared/services/tracker.service";
import type { Tracker } from "@/shared/types";
import {
  Radio,
  Search,
  Filter,
  Download,
  Battery,
  MapPin,
  Clock,
  FileText,
  Plus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { TrackerStatus } from "@/data/mockData";
import { exportToCSV, exportToText } from "@/shared/services/export.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { useToast } from "@/shared/hooks/use-toast";

const Trackers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrackerStatus | "all">("all");
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Tracker Form State
  const [formData, setFormData] = useState({
    deviceId: "",
    meterId: "",
    name: "",
    status: "in_storage" as TrackerStatus,
    batteryLevel: 100,
    latitude: 28.6139,
    longitude: 77.2090,
  });

  const loadTrackers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await trackerService.getTrackers();
      setTrackers(data);
    } catch {
      setTrackers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrackers();
  }, [loadTrackers]);

  const handleCreateTracker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deviceId || !formData.meterId) {
      toast({
        title: "Validation Error",
        description: "Device ID and Meter ID are required.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await trackerService.createTracker({
        deviceId: formData.deviceId.trim().toUpperCase(),
        meterId: formData.meterId.trim().toUpperCase(),
        name: formData.name || formData.deviceId.trim().toUpperCase(),
        status: formData.status,
        batteryLevel: Number(formData.batteryLevel) || 100,
        latitude: Number(formData.latitude) || 28.6139,
        longitude: Number(formData.longitude) || 77.2090,
      });

      toast({
        title: "Tracker Registered",
        description: `Device ${created.device_id} successfully saved to database.`,
      });

      setIsAddOpen(false);
      setFormData({
        deviceId: "",
        meterId: "",
        name: "",
        status: "in_storage",
        batteryLevel: 100,
        latitude: 28.6139,
        longitude: 77.2090,
      });

      loadTrackers();
    } catch (err: any) {
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to create tracker",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = trackers.filter((t) => {
    const matchSearch =
      (t.device_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.meter_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.assigned_to && t.assigned_to.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trackers</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and monitor all smart meter GPS devices from the live database
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 shadow-sm hover:opacity-95 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Register Tracker
            </button>
            <button
              onClick={loadTrackers}
              title="Reload from backend"
              className="glass-card-hover p-2 text-muted-foreground hover:text-foreground rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>
            <button
              onClick={() =>
                exportToCSV(
                  filtered.map((t) => ({
                    Device: t.device_id,
                    Meter: t.meter_id,
                    Status: statusConfig[t.status]?.label || t.status,
                    Battery: `${t.battery_level}%`,
                    Lat: t.latitude,
                    Lng: t.longitude,
                    Assigned: t.assigned_to || "",
                    Route: t.route || t.warehouse || "",
                    Updated: t.last_updated,
                  })),
                  "trackers"
                )
              }
              className="glass-card-hover px-3 py-2 flex items-center gap-2 text-xs text-foreground"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={() =>
                exportToText(
                  filtered.map((t) => ({
                    Device: t.device_id,
                    Meter: t.meter_id,
                    Status: statusConfig[t.status]?.label || t.status,
                    Battery: `${t.battery_level}%`,
                    Assigned: t.assigned_to || "",
                    Route: t.route || t.warehouse || "",
                  })),
                  "trackers_report",
                  "MeterTrack - Trackers Report"
                )
              }
              className="glass-card-hover px-3 py-2 flex items-center gap-2 text-xs text-foreground"
            >
              <FileText className="w-3.5 h-3.5" />
              Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by device, meter, or assignee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-9 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {["all", "in_storage", "in_transit", "installed_off", "detached"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as TrackerStatus | "all")}
                className={`badge-glass text-xs transition-all ${
                  statusFilter === s
                    ? "border-primary/40 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s === "all" ? "All" : statusConfig[s as TrackerStatus]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Empty State */}
        <div className="glass-card overflow-hidden rounded-2xl">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Loading trackers from backend...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <Radio className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="text-base font-bold text-foreground">No trackers found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-5">
                {search || statusFilter !== "all"
                  ? "No trackers match your search criteria. Try resetting the filters."
                  : "There are currently no smart meter trackers in the database. Register your first device to begin monitoring."}
              </p>
              <button
                onClick={() => setIsAddOpen(true)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs inline-flex items-center gap-2 shadow-sm hover:opacity-95"
              >
                <Plus className="w-4 h-4" />
                Register New Tracker
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    {[
                      "Device ID",
                      "Meter ID",
                      "Status",
                      "Battery",
                      "Location",
                      "Assigned To",
                      "Route/Warehouse",
                      "Last Updated",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filtered.map((t) => {
                    const config = statusConfig[t.status] || {
                      label: t.status,
                      dotClass: "status-dot-storage",
                      color: "info",
                    };
                    const updated = new Date(t.last_updated);
                    return (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/trackers/${t.id}`)}
                        className="hover:bg-secondary/40 transition-colors group cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-mono font-bold text-foreground group-hover:text-primary transition-colors">
                              {t.device_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{t.meter_id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className={config.dotClass} />
                            <span className="text-xs">{config.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Battery
                              className={`w-3.5 h-3.5 ${
                                t.battery_level < 20
                                  ? "text-destructive"
                                  : t.battery_level < 50
                                  ? "text-warning"
                                  : "text-success"
                              }`}
                            />
                            <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  t.battery_level > 60
                                    ? "bg-success"
                                    : t.battery_level > 20
                                    ? "bg-warning"
                                    : "bg-destructive"
                                }`}
                                style={{ width: `${t.battery_level}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">{t.battery_level}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {t.latitude?.toFixed(4)}, {t.longitude?.toFixed(4)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.assigned_to || "—"}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.route || t.warehouse || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {updated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[11px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end gap-1">
                            View &rarr;
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between p-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Showing {filtered.length} of {trackers.length} trackers
            </span>
          </div>
        </div>

        {/* Register Tracker Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                Register New Tracker
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateTracker} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Device ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRK-101"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="glass-input w-full mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Meter ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MTR-5001"
                    value={formData.meterId}
                    onChange={(e) => setFormData({ ...formData, meterId: e.target.value })}
                    className="glass-input w-full mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Device Name / Label</label>
                <input
                  type="text"
                  placeholder="e.g. Noida Sector 62 Smart Gateway"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TrackerStatus })}
                    className="glass-input w-full mt-1 text-xs"
                  >
                    <option value="in_storage">In Storage</option>
                    <option value="in_transit">In Transit</option>
                    <option value="installed_off">Installed</option>
                    <option value="detached">Detached</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Battery Level (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.batteryLevel}
                    onChange={(e) => setFormData({ ...formData, batteryLevel: Number(e.target.value) })}
                    className="glass-input w-full mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    className="glass-input w-full mt-1 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    className="glass-input w-full mt-1 text-xs"
                  />
                </div>
              </div>

              <DialogFooter className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Tracker
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Trackers;
