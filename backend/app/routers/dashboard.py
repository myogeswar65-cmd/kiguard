import json
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ActionRequest, Approval, Agent, Policy, AuditLog
from app.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(ActionRequest).count()
    allowed = db.query(ActionRequest).filter(ActionRequest.decision == "ALLOW").count()
    blocked = db.query(ActionRequest).filter(ActionRequest.decision == "BLOCK").count()
    human_approval = db.query(ActionRequest).filter(ActionRequest.decision == "HUMAN_APPROVAL").count()
    pending_approvals = db.query(Approval).filter(Approval.status == "PENDING").count()
    high_risk = db.query(ActionRequest).filter(ActionRequest.risk_level == "HIGH").count()
    critical_risk = db.query(ActionRequest).filter(ActionRequest.risk_level == "CRITICAL").count()
    active_agents = db.query(Agent).filter(Agent.status == "active").count()
    active_policies = db.query(Policy).filter(Policy.enabled == True).count()

    recent_logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(10)
        .all()
    )

    recent_activity = []
    for log in recent_logs:
        recent_activity.append({
            "id": log.id,
            "request_id": log.request_id,
            "agent_name": log.agent_name,
            "action_type": log.action_type,
            "target_resource": log.target_resource,
            "decision": log.decision,
            "risk_score": log.risk_score,
            "risk_level": log.risk_level,
            "matched_policies": json.loads(log.matched_policies or "[]"),
            "created_at": log.created_at.isoformat() if log.created_at else None,
        })

    return DashboardStats(
        total_requests=total,
        allowed=allowed,
        blocked=blocked,
        human_approval=human_approval,
        pending_approvals=pending_approvals,
        high_risk=high_risk,
        critical_risk=critical_risk,
        active_agents=active_agents,
        active_policies=active_policies,
        recent_activity=recent_activity,
    )
