"use client";

import { Settings, CheckCircle, Shield, Layers, Server } from "lucide-react";

const TECH_STACK = [
  { name: "Next.js 14", role: "Frontend framework", category: "frontend" },
  { name: "TypeScript", role: "Type-safe JavaScript", category: "frontend" },
  { name: "Tailwind CSS", role: "Utility-first styling", category: "frontend" },
  { name: "Lucide React", role: "Icon library", category: "frontend" },
  { name: "FastAPI", role: "Backend REST API", category: "backend" },
  { name: "Python 3.11+", role: "Server runtime", category: "backend" },
  { name: "SQLite", role: "Embedded database", category: "backend" },
  { name: "SQLAlchemy", role: "ORM & query builder", category: "backend" },
  { name: "Pydantic v2", role: "Data validation & schemas", category: "backend" },
  { name: "Uvicorn", role: "ASGI server", category: "backend" },
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-700/40 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-slate-200 font-medium font-mono">{value}</span>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" />
          Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          System information and configuration reference.
        </p>
      </div>

      <div className="space-y-5">
        {/* System Status */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Server className="w-4 h-4 text-blue-400" />
            System Status
          </h2>
          <div className="flex items-center gap-3 mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold text-sm">PROTECTED</span>
            <span className="text-slate-400 text-xs ml-1">— Gateway is active and monitoring all agent actions</span>
          </div>
          <InfoRow label="Backend URL" value="http://localhost:8000" />
          <InfoRow label="API Version" value="1.0.0" />
          <InfoRow label="Frontend URL" value="http://localhost:3000" />
          <InfoRow label="Swagger Docs" value="http://localhost:8000/docs" />
          <InfoRow label="Health Check" value="GET /health" />
        </div>

        {/* Gateway Configuration */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-blue-400" />
            Gateway Configuration
          </h2>
          <p className="text-xs text-slate-500 mb-4 bg-slate-700/40 rounded-lg p-3">
            These values are computed at runtime. To change thresholds, update the corresponding policy rules or the risk engine source code.
          </p>
          <InfoRow label="Default Decision (no match)" value="ALLOW" />
          <InfoRow label="Auto-Block Risk Threshold" value="≥ 90" />
          <InfoRow label="Auto-Review Risk Threshold" value="≥ 60 (if ALLOW)" />
          <InfoRow label="Trust Level Impact" value="±20 risk points" />
          <InfoRow label="Max Policy Priority" value="200 (highest = 1)" />
          <InfoRow label="CORS Allowed Origin" value="http://localhost:3000" />
        </div>

        {/* Tech Stack */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-blue-400" />
            Tech Stack
          </h2>

          <div className="mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Frontend</p>
            <div className="grid grid-cols-2 gap-2">
              {TECH_STACK.filter((t) => t.category === "frontend").map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 bg-slate-700/40 rounded-lg px-3 py-2"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Backend</p>
            <div className="grid grid-cols-2 gap-2">
              {TECH_STACK.filter((t) => t.category === "backend").map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 bg-slate-700/40 rounded-lg px-3 py-2"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
          <h2 className="text-base font-bold text-white mb-3">Quick Start Commands</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-1">Start Backend</p>
              <pre className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-green-400">
                cd backend && uvicorn app.main:app --reload
              </pre>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Start Frontend</p>
              <pre className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs font-mono text-green-400">
                cd frontend && npm run dev
              </pre>
            </div>
          </div>
        </div>

        <div className="text-center py-2">
          <p className="text-xs text-slate-600">KiGuard v1.0 · Hackathon Demo · AI Agent Permission Gateway</p>
        </div>
      </div>
    </div>
  );
}
