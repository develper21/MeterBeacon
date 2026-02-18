import { LucideIcon } from "lucide-react";
import { useCountUp } from "@/hooks/useGSAP";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'primary' | 'warning' | 'info' | 'success' | 'destructive';
  subtitle?: string;
}

const colorMap = {
  primary: { icon: 'text-primary', bg: 'bg-primary/12' },
  warning: { icon: 'text-warning', bg: 'bg-warning/12' },
  info: { icon: 'text-info', bg: 'bg-info/12' },
  success: { icon: 'text-success', bg: 'bg-success/12' },
  destructive: { icon: 'text-destructive', bg: 'bg-destructive/12' },
};

export function StatsCard({ icon: Icon, label, value, color, subtitle }: StatsCardProps) {
  const c = colorMap[color];
  const isNumber = typeof value === 'number';
  const countRef = useCountUp(isNumber ? value : 0);

  return (
    <div className="glass-card-hover p-4 rounded-2xl">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">{label}</p>
          <p className="text-xl font-bold text-foreground mt-0.5">
            {isNumber ? <span ref={countRef}>0</span> : value}
          </p>
          {subtitle && <p className="text-[10px] text-destructive font-medium mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
