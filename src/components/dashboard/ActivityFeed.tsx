import { Activity as ActivityType } from "@/data/mockData";
import { Activity, MapPin, BatteryWarning, Shield, Clock } from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityType[];
}

const typeConfig = {
  location_update: { icon: MapPin, color: 'text-info' },
  status_change: { icon: Activity, color: 'text-primary' },
  battery_alert: { icon: BatteryWarning, color: 'text-destructive' },
  geofence_alert: { icon: Shield, color: 'text-warning' },
};

function timeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="glass-card rounded-2xl">
      <div className="flex items-center gap-2 p-4 border-b border-border/40">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
      </div>
      <div className="divide-y divide-border/20">
        {activities.map((a) => {
          const config = typeConfig[a.type];
          const Icon = config.icon;
          return (
            <div key={a.id} className="flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors rounded-lg mx-1">
              <div className="mt-0.5">
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-foreground">{a.device_id}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{a.message}</p>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {timeAgo(a.timestamp)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
