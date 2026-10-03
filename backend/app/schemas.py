from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─── Agent Schemas ────────────────────────────────────────────────────────────

class AgentCreate(BaseModel):
    name: str
    agent_type: str
    description: Optional[str] = ""
    trust_level: int = Field(default=50, ge=0, le=100)
    status: Optional[str] = "active"


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    agent_type: Optional[str] = None
    description: Optional[str] = None
    trust_level: Optional[int] = Field(default=None, ge=0, le=100)
    status: Optional[str] = None


class AgentOut(BaseModel):
    id: int
    name: str
    agent_type: str
    description: str
    trust_level: int
    status: str
    created_at: datetime
    last_active: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ─── Policy Schemas ───────────────────────────────────────────────────────────

class PolicyCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    action_types: List[str] = []
    target_patterns: List[str] = [".*"]
    decision: str  # ALLOW | HUMAN_APPROVAL | BLOCK
    risk_modifier: int = Field(default=0, ge=-30, le=50)
    enabled: bool = True
    priority: int = Field(default=50, ge=1, le=200)


class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    action_types: Optional[List[str]] = None
    target_patterns: Optional[List[str]] = None
    decision: Optional[str] = None
    risk_modifier: Optional[int] = Field(default=None, ge=-30, le=50)
    enabled: Optional[bool] = None
    priority: Optional[int] = Field(default=None, ge=1, le=200)


class PolicyOut(BaseModel):
    id: int
    name: str
    description: str
    action_types: List[str]
    target_patterns: List[str]
    decision: str
    risk_modifier: int
    enabled: bool
    priority: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Gateway Schemas ──────────────────────────────────────────────────────────

class EvaluateRequest(BaseModel):
    agent_id: Optional[int] = None
    agent_name: Optional[str] = "unknown-agent"
    action_type: str
    target_resource: str
    parameters: Optional[Dict[str, Any]] = {}
    context: Optional[Dict[str, Any]] = {}


class RiskFactor(BaseModel):
    name: str
    score: int
    description: str


class EvaluateResponse(BaseModel):
    request_id: str
    decision: str          # ALLOW | HUMAN_APPROVAL | BLOCK
    risk_score: int
    risk_level: str        # LOW | MEDIUM | HIGH | CRITICAL
    reason: str
    matched_policies: List[str]
    risk_factors: List[RiskFactor]


# ─── Approval Schemas ─────────────────────────────────────────────────────────

class ApprovalActionRequest(BaseModel):
    approver: Optional[str] = "admin"
    reason: Optional[str] = ""


class ApprovalOut(BaseModel):
    id: int
    request_id: str
    agent_name: Optional[str]
    action_type: Optional[str]
    target_resource: Optional[str]
    risk_score: int
    risk_level: str
    reason: str
    status: str
    approver: Optional[str]
    approval_reason: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ─── Audit Log Schemas ────────────────────────────────────────────────────────

class AuditLogOut(BaseModel):
    id: int
    request_id: str
    agent_name: Optional[str]
    action_type: str
    target_resource: str
    decision: str
    risk_score: int
    risk_level: str
    matched_policies: List[str]
    approver: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── Dashboard Schemas ────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_requests: int
    allowed: int
    blocked: int
    human_approval: int
    pending_approvals: int
    high_risk: int
    critical_risk: int
    active_agents: int
    active_policies: int
    recent_activity: List[Dict[str, Any]]
