import json
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ActionRequest, Approval, AuditLog, Agent
from app.schemas import EvaluateRequest, EvaluateResponse, RiskFactor
from app.engines import policy_engine, risk_engine

router = APIRouter(prefix="/api/gateway", tags=["gateway"])


@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate_action(req: EvaluateRequest, db: Session = Depends(get_db)):
    """
    Core gateway endpoint — evaluates an agent action against policies and risk engine.
    Returns a decision: ALLOW | HUMAN_APPROVAL | BLOCK.
    """
    request_id = str(uuid.uuid4())

    # Resolve agent trust level
    trust_level = 50  # default
    agent_name = req.agent_name or "unknown-agent"
    if req.agent_id:
        agent = db.query(Agent).filter(Agent.id == req.agent_id).first()
        if agent:
            trust_level = agent.trust_level
            agent_name = agent.name

    # Run policy engine
    decision, matched_policies, policy_modifier = policy_engine.evaluate(
        req.action_type, req.target_resource, db
    )

    # Run risk engine
    risk_score, risk_level, factors = risk_engine.calculate(
        action_type=req.action_type,
        target_resource=req.target_resource,
        trust_level=trust_level,
        policy_modifier=policy_modifier,
        context=req.context or {}
    )

    # Override decision based on extreme risk scores
    if risk_score >= 90 and decision != "BLOCK":
        decision = "BLOCK"
        matched_policies.append("Risk Score Override (≥90)")
    elif risk_score >= 60 and decision == "ALLOW":
        decision = "HUMAN_APPROVAL"
        matched_policies.append("Risk Score Override (≥60)")

    # Build human-readable reason
    reason = _build_reason(decision, risk_level, matched_policies, req.action_type, req.target_resource)

    # Persist action request
    action_req = ActionRequest(
        request_id=request_id,
        agent_id=req.agent_id,
        agent_name=agent_name,
        action_type=req.action_type,
        target_resource=req.target_resource,
        parameters=json.dumps(req.parameters or {}),
        context=json.dumps(req.context or {}),
        decision=decision,
        risk_score=risk_score,
        risk_level=risk_level,
        reason=reason,
        matched_policies=json.dumps(matched_policies),
        risk_factors=json.dumps([f for f in factors]),
    )
    db.add(action_req)

    # Create approval record if needed
    if decision == "HUMAN_APPROVAL":
        approval = Approval(
            request_id=request_id,
            agent_name=agent_name,
            action_type=req.action_type,
            target_resource=req.target_resource,
            risk_score=risk_score,
            risk_level=risk_level,
            reason=reason,
            status="PENDING",
        )
        db.add(approval)

    # Write audit log
    audit = AuditLog(
        request_id=request_id,
        agent_name=agent_name,
        action_type=req.action_type,
        target_resource=req.target_resource,
        decision=decision,
        risk_score=risk_score,
        risk_level=risk_level,
        matched_policies=json.dumps(matched_policies),
    )
    db.add(audit)

    # Update agent last_active
    if req.agent_id:
        db.query(Agent).filter(Agent.id == req.agent_id).update(
            {"last_active": datetime.utcnow()}
        )

    db.commit()

    return EvaluateResponse(
        request_id=request_id,
        decision=decision,
        risk_score=risk_score,
        risk_level=risk_level,
        reason=reason,
        matched_policies=matched_policies,
        risk_factors=[RiskFactor(**f) for f in factors],
    )


def _build_reason(decision: str, risk_level: str, policies: list, action_type: str, target: str) -> str:
    if decision == "BLOCK":
        if policies:
            return f"Action blocked by policy '{policies[0]}'. Risk level: {risk_level}. Target '{target}' matches a restricted pattern."
        return f"Action blocked due to {risk_level} risk score. Action '{action_type}' on '{target}' is not permitted."
    elif decision == "HUMAN_APPROVAL":
        if policies:
            return f"Policy '{policies[0]}' requires human review. Risk level: {risk_level}. Awaiting approval."
        return f"Action '{action_type}' on '{target}' carries {risk_level} risk — human review required."
    else:
        if policies:
            return f"Permitted by policy '{policies[0]}'. Risk level: {risk_level}. Action is within acceptable parameters."
        return f"No restricting policies matched. Risk level: {risk_level}. Action allowed by default."
