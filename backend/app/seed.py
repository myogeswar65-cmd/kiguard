"""
Seed the database with demo data:
- 5 agents
- 12 default policies
- 15 realistic action requests (spread across ALLOW/HUMAN_APPROVAL/BLOCK)
"""
import json
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.models import Agent, Policy, ActionRequest, Approval, AuditLog
from app.engines.policy_engine import get_default_policies
from app.engines import policy_engine, risk_engine


DEMO_AGENTS = [
    {
        "name": "ResearchBot-Alpha",
        "agent_type": "research",
        "description": "An AI agent that browses the web and reads documents for research tasks.",
        "trust_level": 75,
        "status": "active",
    },
    {
        "name": "DevOps-Agent-01",
        "agent_type": "devops",
        "description": "Handles CI/CD pipelines, deployments, and infrastructure management.",
        "trust_level": 60,
        "status": "active",
    },
    {
        "name": "FinanceBot",
        "agent_type": "finance",
        "description": "Processes invoices, payments, and financial reporting.",
        "trust_level": 80,
        "status": "active",
    },
    {
        "name": "DataAnalyst-7",
        "agent_type": "analytics",
        "description": "Queries databases and generates reports for business intelligence.",
        "trust_level": 65,
        "status": "active",
    },
    {
        "name": "ShadowAgent-X",
        "agent_type": "unknown",
        "description": "Unverified agent with suspicious behavior patterns.",
        "trust_level": 10,
        "status": "suspended",
    },
]


DEMO_REQUESTS = [
    # ── ALLOW decisions ──────────────────────────────────────────────
    {
        "agent_name": "ResearchBot-Alpha",
        "action_type": "read_file",
        "target_resource": "research_notes.md",
        "parameters": {"path": "/workspace/research_notes.md"},
        "context": {},
        "hours_ago": 48,
    },
    {
        "agent_name": "DataAnalyst-7",
        "action_type": "db_query",
        "target_resource": "SELECT name, email FROM users WHERE active=1",
        "parameters": {"query": "SELECT name, email FROM users WHERE active=1"},
        "context": {},
        "hours_ago": 46,
    },
    {
        "agent_name": "ResearchBot-Alpha",
        "action_type": "http_request",
        "target_resource": "http://localhost:8080/internal/api/data",
        "parameters": {"method": "GET"},
        "context": {},
        "hours_ago": 44,
    },
    {
        "agent_name": "DataAnalyst-7",
        "action_type": "read_file",
        "target_resource": "quarterly_report.csv",
        "parameters": {"path": "/reports/quarterly_report.csv"},
        "context": {},
        "hours_ago": 40,
    },
    {
        "agent_name": "ResearchBot-Alpha",
        "action_type": "http_request",
        "target_resource": "https://api.github.com/repos/openai/openai-python",
        "parameters": {"method": "GET"},
        "context": {},
        "hours_ago": 36,
    },
    # ── HUMAN_APPROVAL decisions ─────────────────────────────────────
    {
        "agent_name": "DevOps-Agent-01",
        "action_type": "deploy",
        "target_resource": "production/api-service:v2.1.0",
        "parameters": {"version": "v2.1.0", "environment": "production"},
        "context": {},
        "hours_ago": 35,
    },
    {
        "agent_name": "FinanceBot",
        "action_type": "financial_transaction",
        "target_resource": "vendor_payment_acme_corp",
        "parameters": {"amount": 15000, "currency": "USD", "vendor": "ACME Corp"},
        "context": {},
        "hours_ago": 30,
    },
    {
        "agent_name": "DevOps-Agent-01",
        "action_type": "deploy",
        "target_resource": "prod/frontend:v3.5.2",
        "parameters": {"version": "v3.5.2", "environment": "prod"},
        "context": {},
        "hours_ago": 24,
    },
    {
        "agent_name": "DataAnalyst-7",
        "action_type": "db_query",
        "target_resource": "SELECT * FROM customers BULK export all records",
        "parameters": {"query": "SELECT * FROM customers -- bulk export"},
        "context": {},
        "hours_ago": 22,
    },
    {
        "agent_name": "FinanceBot",
        "action_type": "http_request",
        "target_resource": "https://api.stripe.com/v1/charges",
        "parameters": {"method": "POST", "amount": 5000},
        "context": {},
        "hours_ago": 20,
    },
    # ── BLOCK decisions ───────────────────────────────────────────────
    {
        "agent_name": "ShadowAgent-X",
        "action_type": "read_file",
        "target_resource": "/etc/shadow_password_file",
        "parameters": {"path": "/etc/shadow_password_file"},
        "context": {"unusual_location": True},
        "hours_ago": 18,
    },
    {
        "agent_name": "ShadowAgent-X",
        "action_type": "execute",
        "target_resource": "sudo chmod 777 /var/secrets",
        "parameters": {"command": "sudo chmod 777 /var/secrets"},
        "context": {"off_hours": True, "unusual_location": True},
        "hours_ago": 15,
    },
    {
        "agent_name": "DataAnalyst-7",
        "action_type": "db_query",
        "target_resource": "DROP TABLE users",
        "parameters": {"query": "DROP TABLE users"},
        "context": {},
        "hours_ago": 12,
    },
    {
        "agent_name": "ShadowAgent-X",
        "action_type": "http_request",
        "target_resource": "https://pastebin.com/api/upload?data=stolen",
        "parameters": {"method": "POST", "data": "exfiltrated_data"},
        "context": {"off_hours": True},
        "hours_ago": 8,
    },
    {
        "agent_name": "ResearchBot-Alpha",
        "action_type": "read_file",
        "target_resource": "/home/user/.env",
        "parameters": {"path": "/home/user/.env"},
        "context": {},
        "hours_ago": 4,
    },
]


def seed_db(db: Session):
    """Seed demo data if database is empty."""
    if db.query(Agent).count() > 0:
        return  # Already seeded

    # Insert agents
    agent_map = {}
    for a_data in DEMO_AGENTS:
        agent = Agent(**a_data)
        db.add(agent)
        db.flush()
        agent_map[a_data["name"]] = agent.id

    # Insert policies
    for p_data in get_default_policies():
        policy = Policy(
            name=p_data["name"],
            description=p_data["description"],
            action_types=json.dumps(p_data["action_types"]),
            target_patterns=json.dumps(p_data["target_patterns"]),
            decision=p_data["decision"],
            risk_modifier=p_data["risk_modifier"],
            enabled=p_data["enabled"],
            priority=p_data["priority"],
        )
        db.add(policy)

    db.flush()

    # Insert demo requests
    now = datetime.utcnow()
    for req_data in DEMO_REQUESTS:
        request_id = str(uuid.uuid4())
        agent_name = req_data["agent_name"]
        agent_id = agent_map.get(agent_name)

        # Determine trust level
        agent_obj = next((a for a in DEMO_AGENTS if a["name"] == agent_name), None)
        trust_level = agent_obj["trust_level"] if agent_obj else 50

        # Run engines
        decision, matched_policies, policy_modifier = policy_engine.evaluate(
            req_data["action_type"], req_data["target_resource"], db
        )
        risk_score, risk_level, factors = risk_engine.calculate(
            action_type=req_data["action_type"],
            target_resource=req_data["target_resource"],
            trust_level=trust_level,
            policy_modifier=policy_modifier,
            context=req_data.get("context", {}),
        )

        # Apply risk overrides
        if risk_score >= 90 and decision != "BLOCK":
            decision = "BLOCK"
            matched_policies.append("Risk Score Override (≥90)")
        elif risk_score >= 60 and decision == "ALLOW":
            decision = "HUMAN_APPROVAL"
            matched_policies.append("Risk Score Override (≥60)")

        reason = _build_reason(decision, risk_level, matched_policies, req_data["action_type"], req_data["target_resource"])
        created_at = now - timedelta(hours=req_data.get("hours_ago", 0))

        action_req = ActionRequest(
            request_id=request_id,
            agent_id=agent_id,
            agent_name=agent_name,
            action_type=req_data["action_type"],
            target_resource=req_data["target_resource"],
            parameters=json.dumps(req_data.get("parameters", {})),
            context=json.dumps(req_data.get("context", {})),
            decision=decision,
            risk_score=risk_score,
            risk_level=risk_level,
            reason=reason,
            matched_policies=json.dumps(matched_policies),
            risk_factors=json.dumps(factors),
            created_at=created_at,
        )
        db.add(action_req)

        if decision == "HUMAN_APPROVAL":
            approval = Approval(
                request_id=request_id,
                agent_name=agent_name,
                action_type=req_data["action_type"],
                target_resource=req_data["target_resource"],
                risk_score=risk_score,
                risk_level=risk_level,
                reason=reason,
                status="PENDING",
                created_at=created_at,
            )
            db.add(approval)

        audit = AuditLog(
            request_id=request_id,
            agent_name=agent_name,
            action_type=req_data["action_type"],
            target_resource=req_data["target_resource"],
            decision=decision,
            risk_score=risk_score,
            risk_level=risk_level,
            matched_policies=json.dumps(matched_policies),
            created_at=created_at,
        )
        db.add(audit)

    db.commit()
    print("✅ Database seeded with demo data.")


def _build_reason(decision, risk_level, policies, action_type, target):
    if decision == "BLOCK":
        if policies:
            return f"Blocked by '{policies[0]}'. Risk: {risk_level}."
        return f"Blocked — {risk_level} risk for '{action_type}' on '{target}'."
    elif decision == "HUMAN_APPROVAL":
        if policies:
            return f"Policy '{policies[0]}' requires human review. Risk: {risk_level}."
        return f"Human review required — {risk_level} risk."
    else:
        if policies:
            return f"Permitted by '{policies[0]}'. Risk: {risk_level}."
        return f"Allowed by default. Risk: {risk_level}."
