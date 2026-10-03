"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  Zap,
  BarChart2,
  AlertTriangle,
} from "lucide-react";
import DecisionBadge from "@/components/DecisionBadge";
import RiskGauge from "@/components/RiskGauge";
import { evaluateAction, getAgents, type Agent, type EvaluateResponse } from "@/lib/api";

const ACTION_TYPES = [
  "read_file", "write_file", "db_query", "http_request", "execute",
  "deploy", "financial_transaction", "system_call", "file_operation", "send_email",
];

const PRESETS = [
  {
    label: "📄 Read markdown file",
    action_type: "read_file",
    target_resource: "README.md",
    parameters: { path: "./README.md" },
  },
  {
    label: "🔍 SELECT query",
    action_type: "db_query",
    target_resource: "SELECT id, name FROM users WHERE active=1",
    parameters: {},
  },
  {
    label: "🌐 Internal API call",
    action_type: "http_request",
    target_resource: "http://localhost:8080/api/status",
    parameters: { method: "GET" },
  },
  {
    label: "🚀 Deploy to production",
    action_type: "deploy",
    target_resource: "production/api-service:v2.0",
    parameters: { environment: "production" },
  },
  {
    label: "💳 Financial transaction",
    action_type: "financial_transaction",
    target_resource: "stripe_payment_processing",
    parameters: { amount: 9999 },
  },
  {
    label: "🔑 Read .env file",
    action_type: "read_file",
    target_resource: "/app/.env",
    parameters: { path: "/app/.env" },
  },
  {
    label: "💥 DROP TABLE",
    action_type: "db_query",
    target_resource: "DROP TABLE users",
    parameters: {},
  },
  {
    label: "⚠️ sudo chmod 777",
    action_type: "execute",
    target_resource: "sudo chmod 777 /etc/secrets",
    parameters: {},
  },
  {
    label: "📤 Upload to pastebin",
    action_type: "http_request",
    target_resource: "https://pastebin.com/api/upload",
    parameters: { method: "POST" },
  },
];

const DECISION_ICON = {
  ALLOW: <CheckCircle className="w-8 h-8 text-emerald-400" />,
  BLOCK: <XCircle className="w-8 h-8 text-red-400" />,
  HUMAN_APPROVAL: <Clock className="w-8 h-8 text-amber-400" />,
};

const DECISION_BG = {
  ALLOW: "bg-emerald-500/5 border-emerald-500/20",
  BLOCK: "bg-red-500/5 border-red-500/20",
  HUMAN_APPROVAL: "bg-amber-500/5 border-amber-500/20",
};

export default function SimulatorPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [actionType, setActionType] = useState("read_file");
  const [targetResource, setTargetResource] = useState("");
  const [parameters, setParameters] = useState("{}");
  const [offHours, setOffHours] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAgents().then(setAgents).catch(() => {});
  }, []);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setActionType(preset.action_type);
    setTargetResource(preset.target_resource);
    setParameters(JSON.stringify(preset.parameters, null, 2));
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!targetResource.trim()) {
      setError("Target resource is required.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    let params: Record<string, unknown> = {};
    try {
      params = JSON.parse(parameters || "{}");
    } catch {
      params = {};
    }

    const agent = agents.find((a) => a.name === selectedAgent);

    try {
      const res = await evaluateAction({
        agent_id: agent?.id,
        agent_name: selectedAgent || "simulator-agent",
        action_type: actionType,
        target_resource: targetResource,
        parameters: params,
        context: { off_hours: offHours },
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Play className="w-6 h-6 text-blue-400" />
          Agent Simulator
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Submit actions through the real KiGuard gateway and see the decision in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-5">
          {/* Quick Presets */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Quick Presets
            </h2>
            <div className="grid grid-cols-1 gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="text-left text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Form */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
            {/* Agent */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Agent</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">— No agent (anonymous) —</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} (trust: {a.trust_level})
                  </option>
                ))}
              </select>
            </div>

            {/* Action Type */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Action Type</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                {ACTION_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Target Resource */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Resource</label>
              <input
                type="text"
                value={targetResource}
                onChange={(e) => setTargetResource(e.target.value)}
                placeholder="e.g. /etc/passwd, SELECT * FROM users, production/api"
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-500"
              />
            </div>

            {/* Parameters */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Parameters (JSON)</label>
              <textarea
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                rows={3}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            {/* Context flags */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="offHours"
                checked={offHours}
                onChange={(e) => setOffHours(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="offHours" className="text-xs text-slate-400">
                Simulate off-hours execution (+5 risk)
              </label>
            </div>

            {error && (
              <p className="text-red-400 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              <Shield className="w-4 h-4" />
              {loading ? "Evaluating..." : "Evaluate Through Gateway"}
            </button>
          </div>
        </div>

        {/* Right: Result */}
        <div>
          {result ? (
            <div className={`rounded-xl border p-5 space-y-5 animate-slide-in ${DECISION_BG[result.decision] || "bg-slate-800/60 border-slate-700/50"}`}>
              {/* Decision Header */}
              <div className="flex items-center gap-4">
                {DECISION_ICON[result.decision]}
                <div>
                  <DecisionBadge decision={result.decision} size="lg" />
                  <p className="text-xs text-slate-400 mt-1">Request ID: {result.request_id.slice(0, 8)}...</p>
                </div>
              </div>

              {/* Risk Gauge */}
              <RiskGauge score={result.risk_score} level={result.risk_level} size="lg" />

              {/* Reason */}
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs font-medium text-slate-400 mb-1">Reason</p>
                <p className="text-sm text-slate-200">{result.reason}</p>
              </div>

              {/* Matched Policies */}
              {result.matched_policies.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-2">Matched Policies</p>
                  <div className="flex flex-wrap gap-2">
                    {result.matched_policies.map((p) => (
                      <span key={p} className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk Factor Breakdown */}
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" /> Risk Factor Breakdown
                </p>
                <div className="space-y-2">
                  {result.risk_factors.map((f) => (
                    <div key={f.name} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className="text-slate-300 truncate">{f.name}</span>
                          <span className={`font-bold ml-2 ${f.score > 0 ? "text-red-400" : f.score < 0 ? "text-emerald-400" : "text-slate-500"}`}>
                            {f.score > 0 ? "+" : ""}{f.score}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{f.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] bg-slate-800/30 border border-slate-700/30 rounded-xl flex items-center justify-center border-dashed">
              <div className="text-center text-slate-500">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Gateway decision will appear here</p>
                <p className="text-xs mt-1">Pick a preset or fill in the form</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
