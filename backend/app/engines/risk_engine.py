"""
Risk Engine — calculates a transparent risk score (0-100) for an action request.
Each contributing factor is returned individually for the UI's breakdown display.
"""
import re
from typing import List, Dict, Any, Tuple


# ─── Base severity scores per action type ────────────────────────────────────
ACTION_SEVERITY: Dict[str, int] = {
    "read_file": 10,
    "write_file": 25,
    "file_operation": 20,
    "db_query": 20,
    "http_request": 30,
    "send_email": 25,
    "execute": 50,
    "system_call": 55,
    "deploy": 60,
    "financial_transaction": 70,
}
DEFAULT_ACTION_SEVERITY = 20


# ─── Resource sensitivity patterns ───────────────────────────────────────────
RESOURCE_SENSITIVITY_RULES = [
    (r"password|passwd|credentials?|\.env$|\.env\.", 40, "Credential file detected"),
    (r"private.*key|id_rsa|\.pem$|\.p12$|\.pfx$", 40, "Private key/certificate"),
    (r"secret|api[-_]key|access[-_]token|auth[-_]token", 35, "Secret/token resource"),
    (r"production|prod[-_]|[-_]prod\b|\.prod\.", 30, "Production environment"),
    (r"database|\.db$|sql|postgres|mysql|redis", 20, "Database resource"),
    (r"admin|root|superuser", 25, "Privileged resource"),
    (r"sudo|chmod|chown|setuid", 30, "Privilege escalation target"),
    (r"billing|payment|invoice|financial", 30, "Financial resource"),
    (r"DROP\s+|TRUNCATE\s+|DELETE\s+FROM", 35, "Destructive SQL operation"),
    (r"bulk|mass|all\s+records|wildcard", 20, "Mass operation"),
]


def _action_severity(action_type: str) -> Tuple[int, str]:
    score = ACTION_SEVERITY.get(action_type.lower(), DEFAULT_ACTION_SEVERITY)
    return score, f"Base severity for '{action_type}' action"


def _resource_sensitivity(target_resource: str) -> Tuple[int, str]:
    max_score = 0
    max_reason = "Standard resource"
    for pattern, score, reason in RESOURCE_SENSITIVITY_RULES:
        if re.search(pattern, target_resource, re.IGNORECASE):
            if score > max_score:
                max_score = score
                max_reason = reason
    return max_score, max_reason


def _agent_trust_bonus(trust_level: int) -> Tuple[int, str]:
    """Higher trust = lower risk. Returns a negative modifier."""
    bonus = int((trust_level / 100) * 20)
    return -bonus, f"Agent trust level {trust_level}/100 reduces risk by {bonus}"


def _policy_modifier_factor(policy_modifier: int) -> Tuple[int, str]:
    if policy_modifier == 0:
        return 0, "No policy risk modifier"
    direction = "increases" if policy_modifier > 0 else "decreases"
    return policy_modifier, f"Matched policy {direction} risk by {abs(policy_modifier)}"


def _context_flags(context: Dict[str, Any], target_resource: str) -> Tuple[int, str]:
    score = 0
    reasons = []
    if context.get("off_hours"):
        score += 5
        reasons.append("off-hours execution")
    if context.get("unusual_location"):
        score += 10
        reasons.append("unusual source location")
    params_str = str(context.get("parameters", ""))
    if len(params_str) > 500:
        score += 5
        reasons.append("unusually large parameters")
    if context.get("first_time_action"):
        score += 5
        reasons.append("first-time action type")
    if score == 0:
        return 0, "No suspicious context flags"
    return score, f"Context flags: {', '.join(reasons)}"


def calculate(
    action_type: str,
    target_resource: str,
    trust_level: int,
    policy_modifier: int,
    context: Dict[str, Any]
) -> Tuple[int, str, List[Dict[str, Any]]]:
    """
    Calculate risk score with factor breakdown.

    Returns:
        (risk_score, risk_level, factors_list)
    """
    factors = []

    sev_score, sev_reason = _action_severity(action_type)
    factors.append({"name": "Action Severity", "score": sev_score, "description": sev_reason})

    res_score, res_reason = _resource_sensitivity(target_resource)
    factors.append({"name": "Resource Sensitivity", "score": res_score, "description": res_reason})

    trust_score, trust_reason = _agent_trust_bonus(trust_level)
    factors.append({"name": "Agent Trust Bonus", "score": trust_score, "description": trust_reason})

    pol_score, pol_reason = _policy_modifier_factor(policy_modifier)
    factors.append({"name": "Policy Modifier", "score": pol_score, "description": pol_reason})

    ctx_score, ctx_reason = _context_flags(context, target_resource)
    factors.append({"name": "Context Flags", "score": ctx_score, "description": ctx_reason})

    raw = sev_score + res_score + trust_score + pol_score + ctx_score
    risk_score = max(0, min(100, raw))

    if risk_score < 25:
        risk_level = "LOW"
    elif risk_score < 50:
        risk_level = "MEDIUM"
    elif risk_score < 75:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return risk_score, risk_level, factors
