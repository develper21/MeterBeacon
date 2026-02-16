import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  Shield,
  Radio,
  Settings,
  BatteryWarning,
  Truck,
  Package,
  Zap,
  X,
} from "lucide-react";
import { mockTrackers } from "@/data/mockData";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Trackers", url: "/trackers", icon: Radio },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Geofencing", url: "/geofencing", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: AppSidebarProps) {
  const inTransit = mockTrackers.filter(t => t.status === 'in_transit').length;
  const lowBattery = mockTrackers.filter(t => t.battery_level < 20).length;
  const totalTrackers = mockTrackers.length;

  return (
    <aside className="glass-sidebar w-64 min-h-screen flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground tracking-tight">MeterTrack</h1>
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">GPS System</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="p-4 border-b border-border/50">
        <div className="grid grid-cols-3 gap-2">
          <div className="glass-card p-2 text-center">
            <Package className="w-3.5 h-3.5 mx-auto text-info mb-1" />
            <p className="text-xs font-bold text-foreground">{totalTrackers}</p>
            <p className="text-[9px] text-muted-foreground">Total</p>
          </div>
          <div className="glass-card p-2 text-center">
            <Truck className="w-3.5 h-3.5 mx-auto text-warning mb-1" />
            <p className="text-xs font-bold text-foreground">{inTransit}</p>
            <p className="text-[9px] text-muted-foreground">Transit</p>
          </div>
          <div className="glass-card p-2 text-center">
            <BatteryWarning className="w-3.5 h-3.5 mx-auto text-destructive mb-1" />
            <p className="text-xs font-bold text-foreground">{lowBattery}</p>
            <p className="text-[9px] text-muted-foreground">Low Bat</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium px-3 mb-2">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200"
            activeClassName="bg-primary/10 text-primary border border-primary/20 glow-primary"
          >
            <item.icon className="w-4 h-4" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-xs text-muted-foreground">System Online</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">v1.0.0 • Last sync: 2m ago</p>
        </div>
      </div>
    </aside>
  );
}
