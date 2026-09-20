import type { Tracker } from "@/shared/types";
import { statusConfig } from "@/data/mockData";
import { Battery, MapPin, Radio } from "lucide-react";

interface TrackerListMiniProps {
  trackers: Tracker[];
}

export function TrackerListMini({ trackers }: TrackerListMiniProps) {
  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        <Radio className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">All Trackers</h3>
        <span className="badge-glass text-muted-foreground text-[10px]">{trackers.length} total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Device</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Meter</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Status</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Battery</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Location</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-medium px-4 py-3">Assigned To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {trackers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <Radio className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs font-medium text-muted-foreground">No trackers registered in the system</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                    Register a new tracker or connect devices via API to see live telemetry here.
                  </p>
                </td>
              </tr>
            ) : (
              trackers.map((t) => {
                const config = statusConfig[t.status] || {
                  label: t.status,
                  dotClass: "status-dot-storage",
                  color: "info",
                };
                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
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
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              t.battery_level > 60
                                ? "bg-success"
                                : t.battery_level > 20
                                ? "bg-warning"
                                : "bg-destructive"
                            }`}
                            style={{ width: `${t.battery_level}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-mono font-medium ${
                            t.battery_level < 20 ? "text-destructive" : "text-muted-foreground"
                          }`}
                        >
                          {t.battery_level}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>{t.route || t.warehouse || `${t.latitude.toFixed(2)}, ${t.longitude.toFixed(2)}`}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{t.assigned_to || "—"}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
