const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Agent {
  id: number;
  name: string;
  agent_type: string;
  description: string;
  trust_level: number;
  status: string;
  created_at: string;
  last_active: string | null;
}

export interface Policy {
  id: number;
  name: string;
  description: string;
  action_types: string[];
  target_patterns: string[];
  decision: "ALLOW" | "HUMAN_APPROVAL" | "BLOCK";
  risk_modifier: number;
  enabled: boolean;
  priority: number;
  created_at: string;
}

export interface RiskFactor {
  name: string;
  score: number;
  description: string;
}

export interface EvaluateResponse {
  request_id: string;
  decision: "ALLOW" | "HUMAN_APPROVAL" | "BLOCK";
  risk_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reason: string;
  matched_policies: string[];
  risk_factors: RiskFactor[];
}

export interface Approval {
  id: number;
  request_id: string;
  agent_name: string | null;
  action_type: string | null;
  target_resource: string | null;
  risk_score: number;
  risk_level: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approver: string | null;
  approval_reason: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface AuditLog {
  id: number;
  request_id: string;
  agent_name: string | null;
  action_type: string;
  target_resource: string;
  decision: string;
  risk_score: number;
  risk_level: string;
  matched_policies: string[];
  approver: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_requests: number;
  allowed: number;
  blocked: number;
  human_approval: number;
  pending_approvals: number;
  high_risk: number;
  critical_risk: number;
  active_agents: number;
  active_policies: number;
  recent_activity: RecentActivity[];
}

export interface RecentActivity {
  id: number;
  request_id: string;
  agent_name: string | null;
  action_type: string;
  target_resource: string;
  decision: string;
  risk_score: number;
  risk_level: string;
  matched_policies: string[];
  created_at: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const getDashboardStats = () => request<DashboardStats>("/api/dashboard/stats");

// ── Agents ────────────────────────────────────────────────────────────────────

export const getAgents = () => request<Agent[]>("/api/agents");
export const getAgent = (id: number) => request<Agent>(`/api/agents/${id}`);
export const createAgent = (data: Omit<Agent, "id" | "created_at" | "last_active">) =>
  request<Agent>("/api/agents", { method: "POST", body: JSON.stringify(data) });
export const updateAgent = (id: number, data: Partial<Agent>) =>
  request<Agent>(`/api/agents/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAgent = (id: number) =>
  request<{ message: string }>(`/api/agents/${id}`, { method: "DELETE" });

// ── Policies ──────────────────────────────────────────────────────────────────

export const getPolicies = () => request<Policy[]>("/api/policies");
export const getPolicy = (id: number) => request<Policy>(`/api/policies/${id}`);
export const createPolicy = (data: Omit<Policy, "id" | "created_at">) =>
  request<Policy>("/api/policies", { method: "POST", body: JSON.stringify(data) });
export const updatePolicy = (id: number, data: Partial<Policy>) =>
  request<Policy>(`/api/policies/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const togglePolicy = (id: number) =>
  request<Policy>(`/api/policies/${id}/toggle`, { method: "PATCH" });
export const deletePolicy = (id: number) =>
  request<{ message: string }>(`/api/policies/${id}`, { method: "DELETE" });

// ── Gateway ───────────────────────────────────────────────────────────────────

export const evaluateAction = (data: {
  agent_id?: number;
  agent_name?: string;
  action_type: string;
  target_resource: string;
  parameters?: Record<string, unknown>;
  context?: Record<string, unknown>;
}) => request<EvaluateResponse>("/api/gateway/evaluate", {
  method: "POST",
  body: JSON.stringify(data),
});

// ── Approvals ─────────────────────────────────────────────────────────────────

export const getApprovals = (status?: string) =>
  request<Approval[]>(`/api/approvals${status ? `?status=${status}` : ""}`);
export const approveAction = (id: number, data?: { approver?: string; reason?: string }) =>
  request<Approval>(`/api/approvals/${id}/approve`, {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
export const rejectAction = (id: number, data?: { approver?: string; reason?: string }) =>
  request<Approval>(`/api/approvals/${id}/reject`, {
    method: "POST",
    body: JSON.stringify(data || {}),
  });

// ── Audit Logs ────────────────────────────────────────────────────────────────

export const getAuditLogs = (params?: {
  decision?: string;
  agent_name?: string;
  action_type?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}) => {
  const qs = new URLSearchParams();
  if (params?.decision) qs.set("decision", params.decision);
  if (params?.agent_name) qs.set("agent_name", params.agent_name);
  if (params?.action_type) qs.set("action_type", params.action_type);
  if (params?.date_from) qs.set("date_from", params.date_from);
  if (params?.date_to) qs.set("date_to", params.date_to);
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return request<AuditLog[]>(`/api/audit-logs${query ? `?${query}` : ""}`);
};
