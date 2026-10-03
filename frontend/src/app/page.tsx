"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Bot,
  FileText,
  TrendingUp,
  Zap,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import DecisionBadge from "@/components/DecisionBadge";
import RiskGauge from "@/components/RiskGauge";
import { getDashboardStats, type DashboardStats } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
      setError(null);
    } catch (e) {
      setError("Cannot connect to KiGuard backend. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const allowRate = stats && stats.total_requests > 0
    ? Math.round((stats.allowed / stats.total_requests) * 100)
    : 0;

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            KiGuard Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time AI agent permission monitoring
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition-colors"
        >
          <Activity className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Backend not reachable</p>
            <p className="mt-1 text-red-300/80">{error}</p>
            <p className="mt-1">Run: <code className="bg-red-950/50 px-1 rounded">cd backend && uvicorn app.main:app --reload</code></p>
          </div>
        </div>
      )}

      {loading && !stats ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center">
            <Activity className="w-10 h-10 mx-auto mb-3 animate-pulse" />
            <p>Loading dashboard...</p>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Requests" value={stats.total_requests} icon={Activity} color="blue" />
            <StatCard label="Allowed" value={stats.allowed} icon={CheckCircle} color="green" trend={`${allowRate}% allow rate`} />
            <StatCard label="Blocked" value={stats.blocked} icon={XCircle} color="red" />
            <StatCard label="Pending Approvals" value={stats.pending_approvals} icon={Clock} color="amber" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Human Review" value={stats.human_approval} icon={Zap} color="purple" />
            <StatCard label="High Risk" value={stats.high_risk} icon={AlertTriangle} color="red" />
            <StatCard label="Active Agents" value={stats.active_agents} icon={Bot} color="blue" />
            <StatCard label="Active Policies" value={stats.active_policies} icon={Shield} color="green" />
          </div>

          {/* Allow/Block visual bar */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400 font-medium">Decision Distribution</span>
              <span className="text-xs text-slate-500">{stats.total_requests} total</span>
            </div>
            {stats.total_requests > 0 ? (
              <div className="h-6 rounded-full overflow-hidden flex bg-slate-700">
                {stats.allowed > 0 && (
                  <div
                    className="bg-emerald-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                    style={{ width: `${(stats.allowed / stats.total_requests) * 100}%` }}
                    title={`Allowed: ${stats.allowed}`}
                  >
                    {Math.round((stats.allowed / stats.total_requests) * 100)}%
                  </div>
                )}
                {stats.human_approval > 0 && (
                  <div
                    className="bg-amber-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                    style={{ width: `${(stats.human_approval / stats.total_requests) * 100}%` }}
                    title={`Review: ${stats.human_approval}`}
                  >
                    {Math.round((stats.human_approval / stats.total_requests) * 100)}%
                  </div>
                )}
                {stats.blocked > 0 && (
                  <div
                    className="bg-red-500 flex items-center justify-center text-xs font-bold text-white transition-all"
                    style={{ width: `${(stats.blocked / stats.total_requests) * 100}%` }}
                    title={`Blocked: ${stats.blocked}`}
                  >
                    {Math.round((stats.blocked / stats.total_requests) * 100)}%
                  </div>
                )}
              </div>
            ) : (
              <div className="h-6 rounded-full bg-slate-700" />
            )}
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Allowed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Review</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Blocked</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Recent Activity
              </h2>
              <span className="text-xs text-slate-500">Last 10 decisions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/30">
                    <th className="text-left text-xs font-medium text-slate-500 px-5 py-2">Agent</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Action</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Target</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Decision</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Risk</th>
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_activity.map((row) => (
                    <tr key={row.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                      <td className="px-5 py-2.5">
                        <span className="text-sm text-slate-300 font-medium truncate max-w-[120px] block">
                          {row.agent_name || "Unknown"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <code className="text-xs bg-slate-700/60 text-blue-300 px-1.5 py-0.5 rounded">
                          {row.action_type}
                        </code>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-slate-400 truncate max-w-[150px] block">
                          {row.target_resource}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <DecisionBadge decision={row.decision} size="sm" />
                      </td>
                      <td className="px-4 py-2.5 w-36">
                        <RiskGauge score={row.risk_score} level={row.risk_level} size="sm" />
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-xs text-slate-500">
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stats.recent_activity.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No activity yet — try the Agent Simulator
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
