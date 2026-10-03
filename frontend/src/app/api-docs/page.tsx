"use client";

import { BookOpen, Copy, CheckCheck } from "lucide-react";
import { useState } from "react";

function CodeBlock({ code, lang = "json" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700 hover:bg-slate-600 text-slate-300 p-1.5 rounded-md"
        title="Copy to clipboard"
      >
        {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function Section({
  id,
  title,
  method,
  path,
  description,
  children,
}: {
  id: string;
  title: string;
  method: string;
  path: string;
  description: string;
  children: React.ReactNode;
}) {
  const methodColor =
    method === "POST"
      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
      : method === "GET"
      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
      : method === "PATCH"
      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
      : "bg-slate-500/20 text-slate-300 border border-slate-500/30";

  return (
    <section id={id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${methodColor}`}>
            {method}
          </span>
          <code className="text-sm text-slate-300 font-mono">{path}</code>
        </div>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <BookOpen className="w-6 h-6 text-blue-400" />
          API Documentation
        </h1>
        <p className="text-slate-400 text-sm">
          KiGuard REST API — base URL:{" "}
          <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">
            http://localhost:8000
          </code>
        </p>
      </div>

      <div className="space-y-6">
        {/* ── 1. Gateway Evaluate ─────────────────────────────────────────── */}
        <Section
          id="evaluate"
          title="Evaluate Agent Action"
          method="POST"
          path="/api/gateway/evaluate"
          description="The core gateway endpoint. Submits an agent action for evaluation against all policies and the risk engine. Returns a ALLOW / HUMAN_APPROVAL / BLOCK decision with a full risk breakdown."
        >
          <SubSection label="Request Body">
            <CodeBlock code={`{
  "agent_id": 1,             // optional — looks up trust level
  "agent_name": "MyBot",     // optional fallback name
  "action_type": "read_file", // required
  "target_resource": "/path/to/file.md", // required
  "parameters": {},          // optional key-value context
  "context": {
    "off_hours": false,
    "unusual_location": false
  }
}`} />
          </SubSection>

          <SubSection label="Response">
            <CodeBlock code={`{
  "request_id": "uuid-v4",
  "decision": "ALLOW",        // ALLOW | HUMAN_APPROVAL | BLOCK
  "risk_score": 15,           // 0–100
  "risk_level": "LOW",        // LOW | MEDIUM | HIGH | CRITICAL
  "reason": "Permitted by 'Allow Safe File Reads'. Risk level: LOW.",
  "matched_policies": ["Allow Safe File Reads"],
  "risk_factors": [
    { "name": "Action Severity", "score": 10, "description": "Base severity for 'read_file'" },
    { "name": "Resource Sensitivity", "score": 0, "description": "Standard resource" },
    { "name": "Agent Trust Bonus", "score": -15, "description": "Agent trust 75/100" },
    { "name": "Policy Modifier", "score": -5, "description": "Matched policy decreases risk by 5" },
    { "name": "Context Flags", "score": 0, "description": "No suspicious context flags" }
  ]
}`} />
          </SubSection>

          <SubSection label="Python Example">
            <CodeBlock lang="python" code={`import requests

response = requests.post("http://localhost:8000/api/gateway/evaluate", json={
    "agent_name": "my-agent",
    "action_type": "read_file",
    "target_resource": "reports/sales_q4.csv",
    "parameters": {}
})
result = response.json()
print(result["decision"])   # ALLOW, BLOCK, or HUMAN_APPROVAL
print(result["risk_score"]) # e.g. 15`} />
          </SubSection>

          <SubSection label="cURL">
            <CodeBlock lang="bash" code={`curl -X POST http://localhost:8000/api/gateway/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_name": "my-agent",
    "action_type": "read_file",
    "target_resource": "reports/sales_q4.csv"
  }'`} />
          </SubSection>
        </Section>

        {/* ── 2. Policies ──────────────────────────────────────────────────── */}
        <Section
          id="policies"
          title="Policies"
          method="GET"
          path="/api/policies"
          description="List all policies. Use POST to create a new one. Toggle enables/disables a policy without deleting it."
        >
          <SubSection label="GET /api/policies — Response">
            <CodeBlock code={`[
  {
    "id": 1,
    "name": "Block Credential Access",
    "description": "Prevents reading credential files.",
    "action_types": ["read_file", "execute"],
    "target_patterns": [".*password.*", ".*\\.env$"],
    "decision": "BLOCK",
    "risk_modifier": 50,
    "enabled": true,
    "priority": 10,
    "created_at": "2024-01-01T00:00:00"
  }
]`} />
          </SubSection>

          <SubSection label="POST /api/policies — Create Policy">
            <CodeBlock code={`{
  "name": "Block External HTTP",
  "description": "Block requests to untrusted external hosts.",
  "action_types": ["http_request"],
  "target_patterns": [".*\\.external\\.com.*"],
  "decision": "BLOCK",
  "risk_modifier": 40,
  "priority": 15,
  "enabled": true
}`} />
          </SubSection>

          <SubSection label="Other Endpoints">
            <CodeBlock code={`PATCH /api/policies/{id}/toggle   — Toggle enabled/disabled
DELETE /api/policies/{id}         — Delete a policy`} />
          </SubSection>
        </Section>

        {/* ── 3. Agents ────────────────────────────────────────────────────── */}
        <Section
          id="agents"
          title="Agents"
          method="GET"
          path="/api/agents"
          description="Manage registered AI agents. Trust level (0–100) directly influences risk score calculations — higher trust reduces risk."
        >
          <SubSection label="GET /api/agents — Response">
            <CodeBlock code={`[
  {
    "id": 1,
    "name": "ResearchBot-Alpha",
    "agent_type": "research",
    "description": "Browses web and reads documents.",
    "trust_level": 75,
    "status": "active",
    "created_at": "2024-01-01T00:00:00",
    "last_active": "2024-01-02T12:30:00"
  }
]`} />
          </SubSection>

          <SubSection label="POST /api/agents — Create Agent">
            <CodeBlock code={`{
  "name": "MyBot",
  "agent_type": "customer_support",
  "description": "Handles support tickets.",
  "trust_level": 60,
  "status": "active"
}`} />
          </SubSection>

          <SubSection label="Other Endpoints">
            <CodeBlock code={`GET    /api/agents/{id}       — Get single agent
PUT    /api/agents/{id}       — Update agent fields
DELETE /api/agents/{id}       — Delete agent`} />
          </SubSection>
        </Section>

        {/* ── 4. Approvals ─────────────────────────────────────────────────── */}
        <Section
          id="approvals"
          title="Approvals"
          method="GET"
          path="/api/approvals"
          description="When the gateway returns HUMAN_APPROVAL, a pending approval record is created. Use these endpoints to approve or reject it."
        >
          <SubSection label="GET /api/approvals — Query Params">
            <CodeBlock code={`status=PENDING    # filter by status: PENDING | APPROVED | REJECTED`} />
          </SubSection>

          <SubSection label="POST /api/approvals/{id}/approve">
            <CodeBlock code={`{
  "approver": "admin",
  "reason": "Reviewed and approved — legitimate vendor payment."
}`} />
          </SubSection>

          <SubSection label="POST /api/approvals/{id}/reject">
            <CodeBlock code={`{
  "approver": "admin",
  "reason": "Rejected — unrecognized destination account."
}`} />
          </SubSection>
        </Section>

        {/* ── 5. Audit Logs ────────────────────────────────────────────────── */}
        <Section
          id="audit-logs"
          title="Audit Logs"
          method="GET"
          path="/api/audit-logs"
          description="Immutable log of every gateway evaluation. Supports filtering by decision, agent name, action type, and date range."
        >
          <SubSection label="Query Parameters">
            <CodeBlock code={`decision=BLOCK            # ALLOW | BLOCK | HUMAN_APPROVAL
agent_name=ResearchBot    # partial or exact match
action_type=read_file     # filter by action type
date_from=2024-01-01T00:00:00
date_to=2024-01-31T23:59:59
limit=100                 # max records to return`} />
          </SubSection>

          <SubSection label="Example Request">
            <CodeBlock lang="bash" code={`curl "http://localhost:8000/api/audit-logs?decision=BLOCK&limit=20"`} />
          </SubSection>

          <SubSection label="Response">
            <CodeBlock code={`[
  {
    "id": 14,
    "request_id": "abc-uuid",
    "agent_name": "ShadowAgent-X",
    "action_type": "execute",
    "target_resource": "sudo chmod 777 /var/secrets",
    "decision": "BLOCK",
    "risk_score": 95,
    "risk_level": "CRITICAL",
    "matched_policies": ["Block Privilege Escalation"],
    "approver": null,
    "created_at": "2024-01-15T03:22:11"
  }
]`} />
          </SubSection>
        </Section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4 text-center">
          <p className="text-slate-500 text-sm">
            Interactive Swagger UI available at{" "}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              http://localhost:8000/docs
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
