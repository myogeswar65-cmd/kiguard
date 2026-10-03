from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models import Approval, AuditLog
from app.schemas import ApprovalActionRequest, ApprovalOut

router = APIRouter(prefix="/api/approvals", tags=["approvals"])


@router.get("", response_model=List[ApprovalOut])
def list_approvals(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Approval)
    if status:
        query = query.filter(Approval.status == status.upper())
    return query.order_by(Approval.created_at.desc()).all()


@router.post("/{approval_id}/approve", response_model=ApprovalOut)
def approve_action(
    approval_id: int,
    body: ApprovalActionRequest,
    db: Session = Depends(get_db)
):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if approval.status != "PENDING":
        raise HTTPException(status_code=400, detail="Approval is not in PENDING state")

    approval.status = "APPROVED"
    approval.approver = body.approver or "admin"
    approval.approval_reason = body.reason or ""
    approval.updated_at = datetime.utcnow()

    # Update audit log
    audit = db.query(AuditLog).filter(AuditLog.request_id == approval.request_id).first()
    if audit:
        audit.approver = approval.approver

    db.commit()
    db.refresh(approval)
    return approval


@router.post("/{approval_id}/reject", response_model=ApprovalOut)
def reject_action(
    approval_id: int,
    body: ApprovalActionRequest,
    db: Session = Depends(get_db)
):
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    if approval.status != "PENDING":
        raise HTTPException(status_code=400, detail="Approval is not in PENDING state")

    approval.status = "REJECTED"
    approval.approver = body.approver or "admin"
    approval.approval_reason = body.reason or ""
    approval.updated_at = datetime.utcnow()

    # Update audit log
    audit = db.query(AuditLog).filter(AuditLog.request_id == approval.request_id).first()
    if audit:
        audit.approver = approval.approver

    db.commit()
    db.refresh(approval)
    return approval
