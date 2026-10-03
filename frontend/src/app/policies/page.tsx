"use client";

import { useEffect, useState } from "react";
import {
  Shield,
  Plus,
  X,
  Trash2,
  AlertTriangle,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import DecisionBadge from "@/components/DecisionBadge";
import {
  getPolicies,
  createPolicy,
  togglePolicy,
  deletePolicy,
  type Policy,
} from "@/lib/api";

const EMPTY_FORM = {
  name: "",
  description: "",
  action_types: "",
  target_patterns: ".*",
  decision: "ALLOW" as "ALLOW" | "HUMAN_APPROVAL" | "BLOCK",
  risk_modifier: 0,
  priority: 50,
  enabled: true,
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getPolicies();
      setPolicies(data);
    } catch {
      setError("Failed to load policies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      await togglePolicy(id);
      load();
    } catch {
      setError("Failed to toggle policy.");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete policy "${name}"?`)) return;
    try {
      await deletePolicy(id);
      setSuccessMsg(`Policy "${name}" deleted.`);
      load();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete policy.");
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Policy name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const actionTypes = form.action_types
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const targetPatterns = form.target_patterns
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await createPolicy({
        name: form.name,
        description: form.description,
        action_types: actionTypes,
        target_patterns: targetPatterns,
        decision: form.decision,
        risk_modifier: Number(form.risk_modifier),
        priority: Number(form.priority),
        enabled: form.enabled,
      });
      setSuccessMsg(`Policy "${form.name}" created.`);
      setForm({ ...EMPTY_FORM });
      setShowModal(false);
      load();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create policy.");
    } finally {
      setSubmitting(false);
    }
  };

  const DECISION_ORDER: Record<string, number> = { BLOCK: 0, HUMAN_APPROVAL: 1, ALLOW: 2 };
  const sorted = [...policies].sort((a, b) => a.priority - b.priority);

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            Policies
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Define permission rules that govern what agents can do.
          </p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
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

      {/* Policies Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
          <h2 className="font-semibold text-white">Active Policy Rules</h2>
          <span className="text-xs text-slate-500">{policies.length} policies · sorted by priority</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Loading...</div>
        ) : sorted.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No policies yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-2.5">Priority</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Name</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Decision</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Action Types</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Risk Modifier</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Enabled</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Delete</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((policy) => (
                  <tr
                    key={policy.id}
                    className={`border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors ${
                      !policy.enabled ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-5 py-3">
                      <span className="text-xs font-mono text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded">
                        {policy.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-200">{policy.name}</p>
                      {policy.description && (
                        <p className="text-xs text-slate-500 truncate max-w-[220px]">{policy.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <DecisionBadge decision={policy.decision} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {policy.action_types.slice(0, 3).map((t) => (
                          <code
                            key={t}
                            className="text-xs bg-slate-700/60 text-blue-300 px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </code>
                        ))}
                        {policy.action_types.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{policy.action_types.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-bold tabular-nums ${
                          policy.risk_modifier > 0
                            ? "text-red-400"
                            : policy.risk_modifier < 0
                            ? "text-emerald-400"
                            : "text-slate-500"
                        }`}
                      >
                        {policy.risk_modifier > 0 ? "+" : ""}
                        {policy.risk_modifier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(policy.id)}
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                        title={policy.enabled ? "Disable" : "Enable"}
                      >
                        {policy.enabled ? (
                          <ToggleRight className="w-6 h-6 text-blue-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(policy.id, policy.name)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                        title="Delete policy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-lg font-bold text-white">New Policy</h2>
              <button
                onClick={() => { setShowModal(false); setError(null); }}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Block External HTTP"
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="What does this policy do?"
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Action Types <span className="text-slate-500">(comma-separated, e.g. read_file, http_request)</span>
                </label>
                <input
                  type="text"
                  value={form.action_types}
                  onChange={(e) => setForm({ ...form, action_types: e.target.value })}
                  placeholder="read_file, http_request"
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Target Patterns <span className="text-slate-500">(comma-separated regex)</span>
                </label>
                <input
                  type="text"
                  value={form.target_patterns}
                  onChange={(e) => setForm({ ...form, target_patterns: e.target.value })}
                  placeholder=".*password.*, .*secret.*"
                  className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Decision</label>
                  <select
                    value={form.decision}
                    onChange={(e) =>
                      setForm({ ...form, decision: e.target.value as typeof form.decision })
                    }
                    className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALLOW">ALLOW</option>
                    <option value="HUMAN_APPROVAL">HUMAN_APPROVAL</option>
                    <option value="BLOCK">BLOCK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Risk Modifier <span className="text-slate-500">(-30 to 50)</span>
                  </label>
                  <input
                    type="number"
                    min={-30}
                    max={50}
                    value={form.risk_modifier}
                    onChange={(e) => setForm({ ...form, risk_modifier: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Priority <span className="text-slate-500">(1=highest)</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.enabled}
                      onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                      className="w-4 h-4 rounded accent-blue-500"
                    />
                    <span className="text-sm text-slate-300">Enabled</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-700">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {submitting ? "Creating..." : "Create Policy"}
              </button>
              <button
                onClick={() => { setShowModal(false); setError(null); }}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
