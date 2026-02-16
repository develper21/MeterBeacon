import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'primary' | 'warning' | 'info' | 'success' | 'destructive';
  subtitle?: string;
}

const colorMap = {
  primary: { icon: 'text-primary', bg: 'bg-primary/10', glow: 'shadow-[0_0_15px_hsla(187,80%,52%,0.15)]' },
  warning: { icon: 'text-warning', bg: 'bg-warning/10', glow: 'shadow-[0_0_15px_hsla(38,92%,55%,0.15)]' },
  info: { icon: 'text-info', bg: 'bg-info/10', glow: 'shadow-[0_0_15px_hsla(200,80%,55%,0.15)]' },
  success: { icon: 'text-success', bg: 'bg-success/10', glow: 'shadow-[0_0_15px_hsla(150,60%,45%,0.15)]' },
  destructive: { icon: 'text-destructive', bg: 'bg-destructive/10', glow: 'shadow-[0_0_15px_hsla(0,72%,55%,0.15)]' },
};

export function StatsCard({ icon: Icon, label, value, color, subtitle }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div className={`glass-card-hover p-4 ${c.glow}`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="text-[10px] text-destructive font-medium">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
