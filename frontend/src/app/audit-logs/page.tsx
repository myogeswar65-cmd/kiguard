"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import DecisionBadge from "@/components/DecisionBadge";
import { getAuditLogs, type AuditLog } from "@/lib/api";

function RiskScore({ score, level }: { score: number; level: string }) {
  const color =
    level === "CRITICAL"
      ? "text-red-400"
      : level === "HIGH"
      ? "text-orange-400"
      : level === "MEDIUM"
      ? "text-amber-400"
      : "text-emerald-400";
  return (
    <span className={`text-sm font-bold tabular-nums ${color}`}>
      {score}
      <span className="ml-1 text-xs font-normal text-slate-500">{level}</span>
    </span>
  );
}

const DECISION_OPTIONS = ["", "ALLOW", "BLOCK", "HUMAN_APPROVAL"];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterDecision, setFilterDecision] = useState("");
  const [filterAgent, setFilterAgent] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const load = async (params?: {
    decision?: string;
    agent_name?: string;
    action_type?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogs({
        decision: params?.decision || undefined,
        agent_name: params?.agent_name || undefined,
        action_type: params?.action_type || undefined,
      });
      setLogs(data);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApply = () => {
    load({
      decision: filterDecision || undefined,
      agent_name: filterAgent || undefined,
      action_type: filterAction || undefined,
    });
  };

  const handleClear = () => {
    setFilterDecision("");
    setFilterAgent("");
    setFilterAction("");
    load();
  };

  const hasFilters = filterDecision || filterAgent || filterAction;

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            Audit Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Full history of all agent action evaluations.
          </p>
        </div>
        <button
          onClick={() => load({ decision: filterDecision, agent_name: filterAgent, action_type: filterAction })}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 mb-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Decision</label>
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value)}
              className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 min-w-[140px]"
            >
              <option value="">All decisions</option>
              {DECISION_OPTIONS.filter(Boolean).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Agent Name</label>
            <input
              type="text"
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              placeholder="e.g. ResearchBot"
              className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500 w-44"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Action Type</label>
            <input
              type="text"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              placeholder="e.g. read_file"
              className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500 w-40"
            />
          </div>

          <button
            onClick={handleApply}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Search className="w-4 h-4" />
            Apply
          </button>

          {hasFilters && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg text-sm border border-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
          <h2 className="font-semibold text-white">Event Log</h2>
          <span className="text-xs text-slate-500">
            {loading ? "Loading..." : `${logs.length} records`}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            No audit logs match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-2.5">Timestamp</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Agent</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Action</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Target Resource</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Decision</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Risk</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Approver</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-2.5">
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm text-slate-300 font-medium">
                        {log.agent_name || "Unknown"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <code className="text-xs bg-slate-700/60 text-blue-300 px-1.5 py-0.5 rounded whitespace-nowrap">
                        {log.action_type}
                      </code>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className="text-xs text-slate-400 truncate max-w-[200px] block"
                        title={log.target_resource}
                      >
                        {log.target_resource}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <DecisionBadge decision={log.decision} size="sm" />
                    </td>
                    <td className="px-4 py-2.5">
                      <RiskScore score={log.risk_score} level={log.risk_level} />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-slate-500">
                        {log.approver || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
