from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Float
from sqlalchemy.sql import func
from app.database import Base


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    agent_type = Column(String, nullable=False)
    description = Column(Text, default="")
    trust_level = Column(Integer, default=50)  # 0-100
    status = Column(String, default="active")  # active | suspended
    created_at = Column(DateTime, server_default=func.now())
    last_active = Column(DateTime, nullable=True)


class Policy(Base):
    __tablename__ = "policies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, default="")
    action_types = Column(Text, default="[]")   # JSON array
    target_patterns = Column(Text, default="[]")  # JSON array of regex strings
    decision = Column(String, nullable=False)   # ALLOW | HUMAN_APPROVAL | BLOCK
    risk_modifier = Column(Integer, default=0)  # -30 to +50
    enabled = Column(Boolean, default=True)
    priority = Column(Integer, default=50)
    created_at = Column(DateTime, server_default=func.now())


class ActionRequest(Base):
    __tablename__ = "action_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True, nullable=False)
    agent_id = Column(Integer, nullable=True)
    agent_name = Column(String, nullable=True)
    action_type = Column(String, nullable=False)
    target_resource = Column(String, nullable=False)
    parameters = Column(Text, default="{}")    # JSON
    context = Column(Text, default="{}")       # JSON
    decision = Column(String, nullable=False)  # ALLOW | HUMAN_APPROVAL | BLOCK
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="LOW")
    reason = Column(Text, default="")
    matched_policies = Column(Text, default="[]")   # JSON array
    risk_factors = Column(Text, default="{}")        # JSON object
    created_at = Column(DateTime, server_default=func.now())


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, index=True, nullable=False)
    agent_name = Column(String, nullable=True)
    action_type = Column(String, nullable=True)
    target_resource = Column(String, nullable=True)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="LOW")
    reason = Column(Text, default="")
    status = Column(String, default="PENDING")  # PENDING | APPROVED | REJECTED
    approver = Column(String, nullable=True)
    approval_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, index=True, nullable=False)
    agent_name = Column(String, nullable=True)
    action_type = Column(String, nullable=False)
    target_resource = Column(String, nullable=False)
    decision = Column(String, nullable=False)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String, default="LOW")
    matched_policies = Column(Text, default="[]")  # JSON
    approver = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
