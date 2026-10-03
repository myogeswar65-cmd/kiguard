"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Bot,
} from "lucide-react";
import DecisionBadge from "@/components/DecisionBadge";
import {
  getApprovals,
  approveAction,
  rejectAction,
  type Approval,
} from "@/lib/api";

type TabType = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

const TABS: { label: string; value: TabType }[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "All", value: "ALL" },
];

function RiskChip({ score, level }: { score: number; level: string }) {
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
      <span className="text-xs font-normal text-slate-500 ml-1">{level}</span>
    </span>
  );
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("PENDING");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingCount = approvals.filter((a) => a.status === "PENDING").length;

  const load = async (tab: TabType = activeTab) => {
    setLoading(true);
    try {
      const status = tab === "ALL" ? undefined : tab;
      const data = await getApprovals(status);
      setApprovals(data);
    } catch {
      setError("Failed to load approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleApprove = async (id: number, agentName: string | null) => {
    setActionLoading(id);
    setError(null);
    try {
      await approveAction(id, { approver: "admin" });
      setSuccessMsg(`Approved action for ${agentName || "agent"}.`);
      load(activeTab);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to approve.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number, agentName: string | null) => {
    setActionLoading(id);
    setError(null);
    try {
      await rejectAction(id, { approver: "admin" });
      setSuccessMsg(`Rejected action for ${agentName || "agent"}.`);
      load(activeTab);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to reject.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-blue-400" />
            Approvals
            {pendingCount > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Review and action pending human approval requests.
          </p>
        </div>
        <button
          onClick={() => load(activeTab)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-800/60 border border-slate-700/50 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.value
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
            {tab.value === "PENDING" && pendingCount > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            {activeTab === "ALL" ? "All Approvals" : `${activeTab.charAt(0) + activeTab.slice(1).toLowerCase()} Approvals`}
          </h2>
          <span className="text-xs text-slate-500">{approvals.length} records</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            Loading...
          </div>
        ) : approvals.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            No approvals in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-2.5">Agent</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Action</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Target Resource</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Risk</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Submitted</th>
                  {activeTab === "PENDING" && (
                    <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {approvals.map((approval) => (
                  <tr
                    key={approval.id}
                    className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="text-sm text-slate-300 font-medium">
                          {approval.agent_name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-700/60 text-blue-300 px-1.5 py-0.5 rounded">
                        {approval.action_type || "—"}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 truncate max-w-[200px] block" title={approval.target_resource || ""}>
                        {approval.target_resource || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RiskChip score={approval.risk_score} level={approval.risk_level} />
                    </td>
                    <td className="px-4 py-3">
                      <DecisionBadge decision={approval.status} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">
                        {new Date(approval.created_at).toLocaleString()}
                      </span>
                    </td>
                    {activeTab === "PENDING" && (
                      <td className="px-4 py-3">
                        {approval.status === "PENDING" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(approval.id, approval.agent_name)}
                              disabled={actionLoading === approval.id}
                              className="flex items-center gap-1 text-xs bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(approval.id, approval.agent_name)}
                              disabled={actionLoading === approval.id}
                              className="flex items-center gap-1 text-xs bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    )}
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
