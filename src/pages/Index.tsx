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
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { MapView } from "@/components/dashboard/MapView";
import { TrackerListMini } from "@/components/dashboard/TrackerListMini";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { mockTrackers, mockActivities } from "@/data/mockData";
import { usePageReveal, useStaggerReveal } from "@/hooks/useGSAP";

const Dashboard = () => {
  const total = mockTrackers.length;
  const inTransit = mockTrackers.filter(t => t.status === 'in_transit').length;
  const inStorage = mockTrackers.filter(t => t.status === 'in_storage').length;
  const installed = mockTrackers.filter(t => t.status === 'installed_off').length;
  const detached = mockTrackers.filter(t => t.status === 'detached').length;
  const lowBattery = mockTrackers.filter(t => t.battery_level < 20).length;
  const avgBattery = Math.round(mockTrackers.reduce((s, t) => s + t.battery_level, 0) / total);

  const pageRef = usePageReveal();
  const statsRef = useStaggerReveal('.stats-item', []);

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
            <div className="badge-glass">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
              <span className="text-success font-semibold">Live</span>
            </div>
            <div className="badge-glass font-mono">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Updated 2m ago</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div className="stats-item"><StatsCard icon={Radio} label="Total Trackers" value={total} color="primary" /></div>
          <div className="stats-item"><StatsCard icon={Truck} label="In Transit" value={inTransit} color="warning" /></div>
          <div className="stats-item"><StatsCard icon={Package} label="In Storage" value={inStorage} color="info" /></div>
          <div className="stats-item"><StatsCard icon={CheckCircle2} label="Installed" value={installed} color="success" /></div>
          <div className="stats-item"><StatsCard icon={Unplug} label="Detached" value={detached} color="destructive" /></div>
          <div className="stats-item"><StatsCard icon={BatteryCharging} label="Avg Battery" value={`${avgBattery}%`} color="primary" subtitle={`${lowBattery} critical`} /></div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Map - takes 2 cols */}
          <div className="xl:col-span-2">
            <MapView trackers={mockTrackers} />
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
                  {mockTrackers.filter(t => t.battery_level < 20).map(t => (
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
            <ActivityFeed activities={mockActivities.slice(0, 6)} />
          </div>
        </div>

        {/* Tracker List */}
        <TrackerListMini trackers={mockTrackers} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
