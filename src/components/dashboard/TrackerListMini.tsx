import { Tracker, statusConfig } from "@/data/mockData";
import { Battery, MapPin, Radio } from "lucide-react";

interface TrackerListMiniProps {
  trackers: Tracker[];
}

export function TrackerListMini({ trackers }: TrackerListMiniProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border/50">
        <Radio className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">All Trackers</h3>
        <span className="badge-glass text-muted-foreground text-[10px]">{trackers.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Device</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Meter</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Status</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Battery</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Location</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Assigned To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {trackers.map((t) => {
              const config = statusConfig[t.status];
              return (
                <tr key={t.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-semibold text-foreground">{t.device_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-muted-foreground">{t.meter_id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={config.dotClass} />
                      <span className="text-xs text-foreground">{config.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            t.battery_level > 60 ? 'bg-success' : t.battery_level > 20 ? 'bg-warning' : 'bg-destructive'
                          }`}
                          style={{ width: `${t.battery_level}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono font-medium ${
                        t.battery_level < 20 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {t.battery_level}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {t.latitude.toFixed(4)}, {t.longitude.toFixed(4)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{t.assigned_to || t.warehouse || '—'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
