import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Policy
from app.schemas import PolicyCreate, PolicyUpdate, PolicyOut

router = APIRouter(prefix="/api/policies", tags=["policies"])


@router.get("", response_model=List[PolicyOut])
def list_policies(db: Session = Depends(get_db)):
    policies = db.query(Policy).order_by(Policy.priority.asc()).all()
    return [_serialize(p) for p in policies]


@router.get("/{policy_id}", response_model=PolicyOut)
def get_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return _serialize(policy)


@router.post("", response_model=PolicyOut, status_code=201)
def create_policy(body: PolicyCreate, db: Session = Depends(get_db)):
    policy = Policy(
        name=body.name,
        description=body.description or "",
        action_types=json.dumps(body.action_types),
        target_patterns=json.dumps(body.target_patterns),
        decision=body.decision,
        risk_modifier=body.risk_modifier,
        enabled=body.enabled,
        priority=body.priority,
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return _serialize(policy)


@router.put("/{policy_id}", response_model=PolicyOut)
def update_policy(policy_id: int, body: PolicyUpdate, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if body.name is not None:
        policy.name = body.name
    if body.description is not None:
        policy.description = body.description
    if body.action_types is not None:
        policy.action_types = json.dumps(body.action_types)
    if body.target_patterns is not None:
        policy.target_patterns = json.dumps(body.target_patterns)
    if body.decision is not None:
        policy.decision = body.decision
    if body.risk_modifier is not None:
        policy.risk_modifier = body.risk_modifier
    if body.enabled is not None:
        policy.enabled = body.enabled
    if body.priority is not None:
        policy.priority = body.priority
    db.commit()
    db.refresh(policy)
    return _serialize(policy)


@router.patch("/{policy_id}/toggle", response_model=PolicyOut)
def toggle_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    policy.enabled = not policy.enabled
    db.commit()
    db.refresh(policy)
    return _serialize(policy)


@router.delete("/{policy_id}")
def delete_policy(policy_id: int, db: Session = Depends(get_db)):
    policy = db.query(Policy).filter(Policy.id == policy_id).first()
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    db.delete(policy)
    db.commit()
    return {"message": "Policy deleted"}


def _serialize(policy: Policy) -> PolicyOut:
    return PolicyOut(
        id=policy.id,
        name=policy.name,
        description=policy.description or "",
        action_types=json.loads(policy.action_types or "[]"),
        target_patterns=json.loads(policy.target_patterns or '[".*"]'),
        decision=policy.decision,
        risk_modifier=policy.risk_modifier,
        enabled=policy.enabled,
        priority=policy.priority,
        created_at=policy.created_at,
    )
