interface DecisionBadgeProps {
  decision: string;
  size?: "sm" | "md" | "lg";
}

const DECISION_STYLES: Record<string, string> = {
  ALLOW: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  BLOCK: "bg-red-500/15 text-red-400 border border-red-500/30",
  HUMAN_APPROVAL: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  PENDING: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  APPROVED: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  REJECTED: "bg-red-500/15 text-red-400 border border-red-500/30",
};

const SIZE_STYLES: Record<string, string> = {
  sm: "text-xs px-1.5 py-0.5 rounded",
  md: "text-xs px-2.5 py-1 rounded-md font-semibold",
  lg: "text-sm px-3 py-1.5 rounded-lg font-bold",
};

const LABELS: Record<string, string> = {
  HUMAN_APPROVAL: "REVIEW",
};

export default function DecisionBadge({ decision, size = "md" }: DecisionBadgeProps) {
  const style = DECISION_STYLES[decision] || "bg-slate-500/15 text-slate-400 border border-slate-500/30";
  const sizeClass = SIZE_STYLES[size];
  const label = LABELS[decision] || decision;

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClass} ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
