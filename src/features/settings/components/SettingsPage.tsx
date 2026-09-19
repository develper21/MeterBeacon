import { DashboardLayout } from "@/features/dashboard";
import { Settings as SettingsIcon, Bell, Shield, Clock, Radio, Wifi, Database, Users, User, Palette, Lock, Globe, Download, Trash2, Map, Smartphone, Mail, Key } from "lucide-react";
import { useState } from "react";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'alerts' | 'system' | 'profile' | 'display' | 'privacy'>('tracker');

  const tabs = [
    { id: 'tracker' as const, label: 'Tracker Config', icon: Radio },
    { id: 'alerts' as const, label: 'Alerts', icon: Bell },
    { id: 'system' as const, label: 'System', icon: Database },
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'display' as const, label: 'Display', icon: Palette },
    { id: 'privacy' as const, label: 'Privacy', icon: Lock },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">System configuration and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-primary border-primary'
                  : 'text-muted-foreground border-transparent hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'tracker' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Radio className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Tracker Configuration</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Update Interval', value: '5 minutes', desc: 'How often trackers send location updates', editable: true },
                  { label: 'GPS Timeout', value: '60 seconds', desc: 'Maximum time to wait for GPS fix', editable: true },
                  { label: 'Deep Sleep Duration', value: '5 minutes', desc: 'Power saving sleep between updates', editable: true },
                  { label: 'GPS Accuracy Threshold', value: '10 meters', desc: 'Minimum accuracy for valid location', editable: true },
                  { label: 'Location Buffer Distance', value: '50 meters', desc: 'Distance threshold for movement detection', editable: true },
                  { label: 'Movement Sensitivity', value: 'Medium', desc: 'Sensitivity for detecting tracker movement', editable: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-glass font-mono text-xs text-primary">{item.value}</span>
                      {item.editable && <button className="text-xs text-primary hover:underline">Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Map className="w-4 h-4 text-info" />
                <h3 className="text-sm font-semibold text-foreground">Map Settings</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Default Map View', value: 'Street', desc: 'Initial map layer type', options: ['Street', 'Satellite', 'Hybrid'] },
                  { label: 'Auto-refresh Interval', value: '30 seconds', desc: 'Map location update frequency', editable: true },
                  { label: 'Show Tracker Trails', value: 'Enabled', desc: 'Display historical movement paths', toggle: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <span className="badge-glass font-mono text-xs text-info">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-foreground">Alert Thresholds</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Low Battery Alert', value: '20%', desc: 'Notify when battery drops below this level', editable: true },
                  { label: 'Critical Battery Alert', value: '10%', desc: 'Critical notification level', editable: true },
                  { label: 'Offline Timeout', value: '30 minutes', desc: 'Mark tracker as offline after no updates', editable: true },
                  { label: 'Speed Limit Alert', value: '80 km/h', desc: 'Alert when tracker exceeds speed', editable: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-glass font-mono text-xs text-warning">{item.value}</span>
                      {item.editable && <button className="text-xs text-primary hover:underline">Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone className="w-4 h-4 text-success" />
                <h3 className="text-sm font-semibold text-foreground">Notification Methods</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Email Notifications', value: 'Enabled', desc: 'Receive alerts via email', toggle: true },
                  { label: 'SMS Notifications', value: 'Disabled', desc: 'Receive alerts via SMS', toggle: true },
                  { label: 'Push Notifications', value: 'Enabled', desc: 'Browser push notifications', toggle: true },
                  { label: 'Alert Frequency', value: 'Immediate', desc: 'How often to send alerts', options: ['Immediate', 'Hourly', 'Daily'] },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <span className={`badge-glass font-mono text-xs ${item.value === 'Enabled' ? 'text-success' : 'text-muted-foreground'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Email Configuration</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Alert Email', value: 'user@example.com', desc: 'Primary email for alerts', editable: true },
                  { label: 'CC Recipients', value: '2 emails', desc: 'Additional alert recipients', editable: true },
                  { label: 'Email Digest', value: 'Daily', desc: 'Summary email frequency', options: ['Off', 'Daily', 'Weekly'] },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-glass font-mono text-xs text-primary">{item.value}</span>
                      {item.editable && <button className="text-xs text-primary hover:underline">Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-4 animate-fade-in">
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
                  { icon: Database, label: 'Storage Used', value: '2.4 GB', color: 'text-warning' },
                  { icon: Globe, label: 'API Requests', value: '1.2K/day', color: 'text-info' },
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

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-success" />
                <h3 className="text-sm font-semibold text-foreground">Data Retention</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Location Data Retention', value: '90 days', desc: 'How long to keep GPS data', editable: true },
                  { label: 'Alert History Retention', value: '180 days', desc: 'Alert log retention period', editable: true },
                  { label: 'Activity Log Retention', value: '365 days', desc: 'User activity log duration', editable: true },
                  { label: 'Auto-cleanup Enabled', value: 'Yes', desc: 'Automatically delete old data', toggle: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-glass font-mono text-xs text-success">{item.value}</span>
                      {item.editable && <button className="text-xs text-primary hover:underline">Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-foreground">API Configuration</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Rate Limit', value: '1000 req/hour', desc: 'API request rate limit', editable: true },
                  { label: 'API Version', value: 'v1.0', desc: 'Current API version' },
                  { label: 'Webhook URL', value: 'Not configured', desc: 'External webhook endpoint', editable: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-glass font-mono text-xs text-warning">{item.value}</span>
                      {item.editable && <button className="text-xs text-primary hover:underline">Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: 'John Doe', desc: 'Your display name', editable: true },
                  { label: 'Email', value: 'john@example.com', desc: 'Primary email address', editable: true },
                  { label: 'Phone', value: '+1 234 567 8900', desc: 'Contact number', editable: true },
                  { label: 'Role', value: 'Admin', desc: 'Your system role' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-glass font-mono text-xs text-primary">{item.value}</span>
                      {item.editable && <button className="text-xs text-primary hover:underline">Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-foreground">Security</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Change Password', value: 'Last changed 30 days ago', desc: 'Update your password', action: true },
                  { label: 'Two-Factor Auth', value: 'Disabled', desc: 'Add extra security layer', toggle: true },
                  { label: 'Active Sessions', value: '3 devices', desc: 'Currently logged in devices', action: true },
                  { label: 'Login Notifications', value: 'Enabled', desc: 'Alert on new login', toggle: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge-glass font-mono text-xs ${item.value === 'Enabled' ? 'text-success' : 'text-muted-foreground'}`}>{item.value}</span>
                      {item.action && <button className="text-xs text-primary hover:underline">Manage</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-info" />
                <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <div>
                    <p className="text-sm text-foreground font-medium">Production Key</p>
                    <p className="text-xs text-muted-foreground">sk_live_xxxxxxxxxxxx</p>
                  </div>
                  <button className="text-xs text-primary hover:underline">Regenerate</button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-foreground font-medium">Test Key</p>
                    <p className="text-xs text-muted-foreground">sk_test_xxxxxxxxxxxx</p>
                  </div>
                  <button className="text-xs text-primary hover:underline">Regenerate</button>
                </div>
                <button className="w-full mt-2 text-xs text-primary hover:underline">+ Generate New API Key</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'display' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Theme', value: 'Dark', desc: 'Color scheme preference', options: ['Light', 'Dark', 'Auto'] },
                  { label: 'Accent Color', value: 'Blue', desc: 'Primary accent color', options: ['Blue', 'Purple', 'Green', 'Orange'] },
                  { label: 'Font Size', value: 'Medium', desc: 'Text size for interface', options: ['Small', 'Medium', 'Large'] },
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

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-info" />
                <h3 className="text-sm font-semibold text-foreground">Regional Settings</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Language', value: 'English', desc: 'Interface language', options: ['English', 'Spanish', 'French', 'German'] },
                  { label: 'Timezone', value: 'UTC+5:30', desc: 'Your local timezone', editable: true },
                  { label: 'Date Format', value: 'DD/MM/YYYY', desc: 'Date display format', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] },
                  { label: 'Time Format', value: '24-hour', desc: 'Time display format', options: ['12-hour', '24-hour'] },
                  { label: 'Units', value: 'Metric', desc: 'Measurement system', options: ['Metric', 'Imperial'] },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-glass font-mono text-xs text-info">{item.value}</span>
                      {item.editable && <button className="text-xs text-primary hover:underline">Edit</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4 animate-fade-in">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Download className="w-4 h-4 text-success" />
                <h3 className="text-sm font-semibold text-foreground">Data Management</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Export All Data', value: 'Download', desc: 'Export your data in JSON format', action: true },
                  { label: 'Export Location History', value: 'Download', desc: 'Export GPS tracking data', action: true },
                  { label: 'Export Alerts', value: 'Download', desc: 'Export alert history', action: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button className="badge-glass font-mono text-xs text-success hover:underline">{item.value}</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-warning" />
                <h3 className="text-sm font-semibold text-foreground">Privacy Settings</h3>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Data Sharing', value: 'Disabled', desc: 'Share anonymized data for improvements', toggle: true },
                  { label: 'Analytics', value: 'Enabled', desc: 'Allow usage analytics', toggle: true },
                  { label: 'Marketing Emails', value: 'Disabled', desc: 'Receive product updates', toggle: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <p className="text-sm text-foreground font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <span className={`badge-glass font-mono text-xs ${item.value === 'Enabled' ? 'text-success' : 'text-muted-foreground'}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 border-destructive/30">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 className="w-4 h-4 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Danger Zone</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <div>
                    <p className="text-sm text-foreground font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <button className="text-xs text-destructive hover:underline font-medium">Delete Account</button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-foreground font-medium">Reset All Settings</p>
                    <p className="text-xs text-muted-foreground">Restore default configuration</p>
                  </div>
                  <button className="text-xs text-destructive hover:underline font-medium">Reset</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
