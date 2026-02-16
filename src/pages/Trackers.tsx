import { DashboardLayout } from "@/components/DashboardLayout";
import { mockTrackers, statusConfig } from "@/data/mockData";
import { Radio, Search, Filter, Download, Battery, MapPin, Clock, MoreVertical, FileText } from "lucide-react";
import { useState } from "react";
import type { TrackerStatus } from "@/data/mockData";
import { exportToCSV, exportToText } from "@/lib/export";

const Trackers = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TrackerStatus | 'all'>('all');

  const filtered = mockTrackers.filter(t => {
    const matchSearch = t.device_id.toLowerCase().includes(search.toLowerCase()) ||
      t.meter_id.toLowerCase().includes(search.toLowerCase()) ||
      (t.assigned_to?.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trackers</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and monitor all GPS tracker devices</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToCSV(filtered.map(t => ({
                Device: t.device_id, Meter: t.meter_id, Status: statusConfig[t.status].label,
                Battery: `${t.battery_level}%`, Lat: t.latitude, Lng: t.longitude,
                Assigned: t.assigned_to || '', Route: t.route || t.warehouse || '', Updated: t.last_updated
              })), "trackers")}
              className="glass-card-hover px-3 py-2 flex items-center gap-2 text-xs text-foreground"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={() => exportToText(filtered.map(t => ({
                Device: t.device_id, Meter: t.meter_id, Status: statusConfig[t.status].label,
                Battery: `${t.battery_level}%`, Assigned: t.assigned_to || '', Route: t.route || t.warehouse || ''
              })), "trackers_report", "MeterTrack - Trackers Report")}
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
              onChange={e => setSearch(e.target.value)}
              className="glass-input w-full pl-9 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {['all', 'in_storage', 'in_transit', 'installed_off', 'detached'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as TrackerStatus | 'all')}
                className={`badge-glass text-xs transition-all ${statusFilter === s ? 'border-primary/40 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {s === 'all' ? 'All' : statusConfig[s as TrackerStatus].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {['Device ID', 'Meter ID', 'Status', 'Battery', 'Location', 'Assigned To', 'Route/Warehouse', 'Last Updated', ''].map(h => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filtered.map(t => {
                  const config = statusConfig[t.status];
                  const updated = new Date(t.last_updated);
                  return (
                    <tr key={t.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Radio className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-mono font-semibold text-foreground">{t.device_id}</span>
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
                          <Battery className={`w-3.5 h-3.5 ${t.battery_level < 20 ? 'text-destructive' : t.battery_level < 50 ? 'text-warning' : 'text-success'}`} />
                          <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div className={`h-full rounded-full ${t.battery_level > 60 ? 'bg-success' : t.battery_level > 20 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${t.battery_level}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{t.battery_level}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-mono text-muted-foreground">{t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.assigned_to || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{t.route || t.warehouse || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {updated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Showing {filtered.length} of {mockTrackers.length} trackers</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Trackers;
