import { DashboardLayout } from "@/components/DashboardLayout";
import { Shield, Plus, MapPin, Radio, AlertTriangle, Settings2 } from "lucide-react";
import { mockGeofences } from "@/data/mockData";

const typeColors = {
  warehouse: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/30' },
  site: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/30' },
  restricted: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/30' },
};

const Geofencing = () => {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Geofencing</h1>
            <p className="text-sm text-muted-foreground mt-1">Define zones and configure alerts for tracker movement</p>
          </div>
          <button className="glass-card-hover px-4 py-2 flex items-center gap-2 text-sm text-primary border-primary/30">
            <Plus className="w-4 h-4" />
            Add Zone
          </button>
        </div>

        {/* Geofence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockGeofences.map(zone => {
            const colors = typeColors[zone.type];
            return (
              <div key={zone.id} className={`glass-card-hover p-4 ${colors.border}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      {zone.type === 'warehouse' ? <MapPin className={`w-4 h-4 ${colors.text}`} /> :
                       zone.type === 'restricted' ? <AlertTriangle className={`w-4 h-4 ${colors.text}`} /> :
                       <Shield className={`w-4 h-4 ${colors.text}`} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{zone.name}</h3>
                      <span className={`badge-glass text-[9px] ${colors.text} mt-1`}>{zone.type.toUpperCase()}</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Center</span>
                    <span className="font-mono text-foreground">{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Radius</span>
                    <span className="text-foreground">{zone.radius}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alert Type</span>
                    <span className="text-foreground capitalize">{zone.alert_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trackers Inside</span>
                    <div className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-primary" />
                      <span className="font-bold text-foreground">{zone.tracker_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Map placeholder for geofences */}
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Zone Map View</h3>
          </div>
          <div className="relative h-[300px] bg-[hsla(222,40%,6%,0.9)] rounded-lg overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {[...Array(10)].map((_, i) => (
                <g key={i}>
                  <line x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="hsla(210,40%,96%,0.03)" strokeWidth="1" />
                  <line x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="hsla(210,40%,96%,0.03)" strokeWidth="1" />
                </g>
              ))}
            </svg>
            {mockGeofences.map((zone, i) => {
              const x = 20 + (i * 15) % 70;
              const y = 25 + (i * 20) % 55;
              const colors = typeColors[zone.type];
              return (
                <div key={zone.id} className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
                  <div className={`w-20 h-20 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center opacity-40`}>
                    <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
                  </div>
                  <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono ${colors.text} whitespace-nowrap`}>{zone.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Geofencing;
