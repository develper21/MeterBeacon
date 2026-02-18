import { DashboardLayout } from "@/components/DashboardLayout";
import { BarChart3, TrendingUp, Activity, Zap } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { dailyUpdates, statusDistribution, batteryDistribution, mockTrackers } from "@/data/mockData";
import { usePageReveal } from "@/hooks/useGSAP";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card p-2.5 text-xs rounded-xl">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

const Analytics = () => {
  const totalUpdates = dailyUpdates.reduce((s, d) => s + d.updates, 0);
  const totalAlerts = dailyUpdates.reduce((s, d) => s + d.alerts, 0);
  const avgBattery = Math.round(mockTrackers.reduce((s, t) => s + t.battery_level, 0) / mockTrackers.length);
  const pageRef = usePageReveal();

  return (
    <DashboardLayout>
      <div ref={pageRef} className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Performance metrics and insights</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Updates (7d)', value: totalUpdates.toLocaleString(), icon: Activity, color: 'text-primary' },
            { label: 'Total Alerts (7d)', value: totalAlerts, icon: Zap, color: 'text-warning' },
            { label: 'Avg Battery', value: `${avgBattery}%`, icon: TrendingUp, color: 'text-success' },
            { label: 'Update Rate', value: '95.2%', icon: BarChart3, color: 'text-info' },
          ].map((item, i) => (
            <div key={i} className="glass-card-hover p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold text-foreground">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Location Updates (7 Days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={dailyUpdates}>
                <defs>
                  <linearGradient id="updateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(24, 85%, 58%)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(24, 85%, 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--chart-grid))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--chart-text))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--chart-text))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="updates" stroke="hsl(24, 85%, 58%)" fill="url(#updateGrad)" strokeWidth={2} name="Updates" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Alerts (7 Days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyUpdates}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--chart-grid))" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--chart-text))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--chart-text))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="alerts" fill="hsl(38, 92%, 55%)" radius={[6, 6, 0, 0]} name="Alerts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Status Distribution</h3>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {statusDistribution.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                    <span className="text-xs text-muted-foreground">{s.name}</span>
                    <span className="text-xs font-bold text-foreground ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl">
            <h3 className="text-sm font-semibold text-foreground mb-4">Battery Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={batteryDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--chart-grid))" />
                <XAxis dataKey="range" tick={{ fill: 'hsl(var(--chart-text))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(var(--chart-text))', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Trackers">
                  {batteryDistribution.map((_, i) => (
                    <Cell key={i} fill={i < 1 ? 'hsl(0, 72%, 55%)' : i < 2 ? 'hsl(38, 92%, 55%)' : 'hsl(150, 55%, 42%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
