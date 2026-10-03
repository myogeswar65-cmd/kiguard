import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import AuditLog
from app.schemas import AuditLogOut

router = APIRouter(prefix="/api/audit-logs", tags=["audit-logs"])


@router.get("", response_model=List[AuditLogOut])
def list_audit_logs(
    decision: Optional[str] = Query(None),
    agent_name: Optional[str] = Query(None),
    action_type: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = Query(default=100, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)

    if decision:
        query = query.filter(AuditLog.decision == decision.upper())
    if agent_name:
        query = query.filter(AuditLog.agent_name.ilike(f"%{agent_name}%"))
    if action_type:
        query = query.filter(AuditLog.action_type.ilike(f"%{action_type}%"))
    if date_from:
        try:
            dt = datetime.fromisoformat(date_from)
            query = query.filter(AuditLog.created_at >= dt)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to)
            query = query.filter(AuditLog.created_at <= dt)
        except ValueError:
            pass

    logs = query.order_by(AuditLog.created_at.desc()).limit(limit).all()
    result = []
    for log in logs:
        result.append(AuditLogOut(
            id=log.id,
            request_id=log.request_id,
            agent_name=log.agent_name,
            action_type=log.action_type,
            target_resource=log.target_resource,
            decision=log.decision,
            risk_score=log.risk_score,
            risk_level=log.risk_level,
            matched_policies=json.loads(log.matched_policies or "[]"),
            approver=log.approver,
            created_at=log.created_at,
        ))
    return result
