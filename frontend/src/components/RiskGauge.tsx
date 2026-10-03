interface RiskGaugeProps {
  score: number;
  level: string;
  size?: "sm" | "md" | "lg";
}

const LEVEL_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  LOW: { bar: "bg-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  MEDIUM: { bar: "bg-amber-500", text: "text-amber-400", bg: "bg-amber-500/10" },
  HIGH: { bar: "bg-orange-500", text: "text-orange-400", bg: "bg-orange-500/10" },
  CRITICAL: { bar: "bg-red-500", text: "text-red-400", bg: "bg-red-500/10" },
};

export default function RiskGauge({ score, level, size = "md" }: RiskGaugeProps) {
  const colors = LEVEL_COLORS[level] || LEVEL_COLORS.LOW;

  if (size === "sm") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-xs font-bold ${colors.text} w-8 text-right`}>{score}</span>
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div className={`rounded-xl p-4 ${colors.bg} border border-current/10`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Risk Score</span>
          <span className={`text-2xl font-black ${colors.text}`}>{score}</span>
        </div>
        <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-700`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-slate-500">0</span>
          <span className={`text-xs font-semibold ${colors.text}`}>{level}</span>
          <span className="text-xs text-slate-500">100</span>
        </div>
      </div>
    );
  }

  // Default md
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-sm font-bold ${colors.text} w-16 text-right`}>
        {score} <span className="font-normal text-xs">{level}</span>
      </span>
    </div>
  );
}
