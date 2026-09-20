import {
  MapPin,
  Radio,
  BatteryCharging,
  AlertTriangle,
  Truck,
  Package,
  CheckCircle2,
  Unplug,
  Clock,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout, StatsCard, MapView, TrackerListMini, ActivityFeed } from "../index";
import { trackerService } from "@/shared/services/tracker.service";
import { notificationService } from "@/shared/services/notification.service";
import type { Tracker } from "@/shared/types";
import type { Activity } from "@/data/mockData";
import { usePageReveal, useStaggerReveal } from "@/shared/hooks/useGSAP";
import { useState, useEffect, useCallback } from "react";

const Dashboard = () => {
  const [trackers, setTrackers] = useState<Tracker[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>("Just now");

  const loadData = useCallback(async () => {
    try {
      const [trackersData, notifsData] = await Promise.all([
        trackerService.getTrackers(),
        notificationService.getNotifications(),
      ]);

      setTrackers(trackersData);

      // Convert notifications to activity feed items
      const notifActivities: Activity[] = notifsData.slice(0, 10).map((n) => {
        let type: Activity["type"] = "status_change";
        if (n.type === "battery_alert") type = "battery_alert";
        else if (n.type === "geofence_alert") type = "geofence_alert";
        else if (n.type === "location_update") type = "location_update";

        return {
          id: n.id,
          type,
          device_id: n.device_id || "SYSTEM",
          message: n.message,
          timestamp: n.created_at,
        };
      });

      setActivities(notifActivities);
      setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {
      // Graceful fallback to empty state
      setTrackers([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const total = trackers.length;
  const inTransit = trackers.filter((t) => t.status === "in_transit").length;
  const inStorage = trackers.filter((t) => t.status === "in_storage").length;
  const installed = trackers.filter((t) => t.status === "installed_off").length;
  const detached = trackers.filter((t) => t.status === "detached").length;
  const lowBattery = trackers.filter((t) => (t.battery_level ?? 0) < 20).length;
  const avgBattery =
    total > 0
      ? Math.round(trackers.reduce((s, t) => s + (t.battery_level ?? 0), 0) / total)
      : 0;

  const pageRef = usePageReveal();
  const statsRef = useStaggerReveal(".stats-item", []);

  return (
    <DashboardLayout>
      <div ref={pageRef} className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Real-time Smart Meter GPS Tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLoading(true);
                loadData();
              }}
              title="Refresh Data"
              className="badge-glass hover:bg-muted/60 transition-colors p-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
            </button>
            <div className="badge-glass">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-success font-semibold">Live Backend</span>
            </div>
            <div className="badge-glass font-mono">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{lastUpdatedTime}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="stats-item">
            <StatsCard icon={Radio} label="Total Trackers" value={total} color="primary" />
          </div>
          <div className="stats-item">
            <StatsCard icon={Truck} label="In Transit" value={inTransit} color="warning" />
          </div>
          <div className="stats-item">
            <StatsCard icon={Package} label="In Storage" value={inStorage} color="info" />
          </div>
          <div className="stats-item">
            <StatsCard icon={CheckCircle2} label="Installed" value={installed} color="success" />
          </div>
          <div className="stats-item">
            <StatsCard icon={Unplug} label="Detached" value={detached} color="destructive" />
          </div>
          <div className="stats-item">
            <StatsCard
              icon={BatteryCharging}
              label="Avg Battery"
              value={`${avgBattery}%`}
              color="primary"
              subtitle={lowBattery > 0 ? `${lowBattery} critical` : "Optimal"}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map - takes 2 cols */}
          <div className="xl:col-span-2">
            <MapView trackers={trackers} />
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Alerts */}
            {lowBattery > 0 && (
              <div className="glass-card p-4 border-warning/20">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">Active Alerts</h3>
                </div>
                <div className="space-y-2">
                  {trackers
                    .filter((t) => (t.battery_level ?? 0) < 20)
                    .map((t) => (
                      <div key={t.id} className="flex items-center justify-between glass-card p-2.5 rounded-xl">
                        <div className="flex items-center gap-2">
                          <BatteryCharging className="w-3.5 h-3.5 text-destructive" />
                          <span className="text-xs font-mono text-foreground">{t.device_id}</span>
                        </div>
                        <span className="text-xs font-bold text-destructive">{t.battery_level}%</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Activity Feed */}
            <ActivityFeed activities={activities} />
          </div>
        </div>

        {/* Tracker List */}
        <TrackerListMini trackers={trackers} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
