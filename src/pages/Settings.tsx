import { DashboardLayout } from "@/components/DashboardLayout";
import { Settings as SettingsIcon, Bell, Shield, Clock, Radio, Wifi, Database, Users } from "lucide-react";

const SettingsPage = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">System configuration and preferences</p>
        </div>

        {/* Tracker Settings */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Tracker Configuration</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Update Interval', value: '5 minutes', desc: 'How often trackers send location updates' },
              { label: 'GPS Timeout', value: '60 seconds', desc: 'Maximum time to wait for GPS fix' },
              { label: 'Deep Sleep Duration', value: '5 minutes', desc: 'Power saving sleep between updates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm text-foreground font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="badge-glass font-mono text-xs text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Settings */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-warning" />
            <h3 className="text-sm font-semibold text-foreground">Alert Thresholds</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Low Battery Alert', value: '20%', desc: 'Notify when battery drops below this level' },
              { label: 'Critical Battery Alert', value: '10%', desc: 'Critical notification level' },
              { label: 'Offline Timeout', value: '30 minutes', desc: 'Mark tracker as offline after no updates' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <div>
                  <p className="text-sm text-foreground font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <span className="badge-glass font-mono text-xs text-warning">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-4 h-4 text-info" />
            <h3 className="text-sm font-semibold text-foreground">System Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Wifi, label: 'API Status', value: 'Online', color: 'text-success' },
              { icon: Database, label: 'Database', value: 'Connected', color: 'text-success' },
              { icon: Users, label: 'Active Users', value: '3', color: 'text-primary' },
              { icon: Clock, label: 'Uptime', value: '99.97%', color: 'text-success' },
            ].map((item, i) => (
              <div key={i} className="glass-card p-3 flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <div>
                  <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  <p className={`text-xs font-bold ${item.color}`}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
