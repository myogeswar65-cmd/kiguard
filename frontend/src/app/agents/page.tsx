"use client";

import { useEffect, useState } from "react";
import {
  Bot,
  Plus,
  X,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  getAgents,
  createAgent,
  updateAgent,
  type Agent,
} from "@/lib/api";

const AGENT_TYPES = [
  "customer_support",
  "data_analyst",
  "finance",
  "email",
  "devops",
  "research",
  "analytics",
  "unknown",
];

function TrustBar({ value }: { value: number }) {
  const color =
    value >= 75
      ? "bg-emerald-500"
      : value >= 50
      ? "bg-blue-500"
      : value >= 25
      ? "bg-amber-500"
      : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-slate-400 w-8 text-right tabular-nums">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        ACTIVE
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
      SUSPENDED
    </span>
  );
}

const EMPTY_FORM = {
  name: "",
  agent_type: "customer_support",
  description: "",
  trust_level: 50,
  status: "active",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await getAgents();
      setAgents(data);
    } catch {
      setError("Failed to load agents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Agent name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createAgent({
        name: form.name,
        agent_type: form.agent_type,
        description: form.description,
        trust_level: Number(form.trust_level),
        status: form.status,
      });
      setSuccessMsg(`Agent "${form.name}" created.`);
      setForm({ ...EMPTY_FORM });
      setShowForm(false);
      load();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create agent.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    const newStatus = agent.status === "active" ? "suspended" : "active";
    try {
      await updateAgent(agent.id, { status: newStatus });
      load();
    } catch {
      setError("Failed to update agent status.");
    }
  };

  return (
    <div className="p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-blue-400" />
            Agents
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage registered AI agents and their trust levels.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Agent"}
        </button>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Add Agent Form */}
      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">New Agent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. ResearchBot-Beta"
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Agent Type</label>
              <select
                value={form.agent_type}
                onChange={(e) => setForm({ ...form, agent_type: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                {AGENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-slate-400 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                placeholder="What does this agent do?"
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Trust Level: <span className="text-blue-400">{form.trust_level}</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={form.trust_level}
                onChange={(e) => setForm({ ...form, trust_level: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-0.5">
                <span>0 (Untrusted)</span>
                <span>100 (Full Trust)</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting ? "Creating..." : "Create Agent"}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(null); }}
              className="text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Agents Table */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700/50">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            Registered Agents
          </h2>
          <span className="text-xs text-slate-500">{agents.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            Loading agents...
          </div>
        ) : agents.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
            No agents registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="text-left text-xs font-medium text-slate-500 px-5 py-2.5">Name</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Type</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5 w-40">Trust Level</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Last Active</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((agent) => (
                  <tr
                    key={agent.id}
                    className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{agent.name}</p>
                          {agent.description && (
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">
                              {agent.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-slate-700/60 text-blue-300 px-1.5 py-0.5 rounded">
                        {agent.agent_type}
                      </code>
                    </td>
                    <td className="px-4 py-3 w-40">
                      <TrustBar value={agent.trust_level} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={agent.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {agent.last_active
                          ? new Date(agent.last_active).toLocaleString()
                          : "Never"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(agent)}
                        className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                          agent.status === "active"
                            ? "bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30"
                            : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                        }`}
                      >
                        {agent.status === "active" ? "Suspend" : "Activate"}
                      </button>
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
