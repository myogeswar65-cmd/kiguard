import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: "blue" | "green" | "red" | "amber" | "purple" | "slate";
  trend?: string;
}

const COLOR_STYLES: Record<string, { icon: string; bg: string; border: string }> = {
  blue: { icon: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  green: { icon: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  red: { icon: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  amber: { icon: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  purple: { icon: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  slate: { icon: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
};

export default function StatCard({ label, value, icon: Icon, color = "blue", trend }: StatCardProps) {
  const c = COLOR_STYLES[color];
  return (
    <div className={`rounded-xl p-4 bg-slate-800/60 border ${c.border} flex items-start gap-4`}>
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-black text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-tight">{label}</p>
        {trend && <p className="text-xs text-slate-500 mt-1">{trend}</p>}
      </div>
    </div>
  );
}
