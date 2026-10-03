"""
Policy Engine — evaluates an action request against enabled policies in priority order.
Returns the first matching policy's decision, or ALLOW with no matched policies if none match.
"""
import json
import re
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models import Policy


def _load_policies(db: Session) -> List[Policy]:
    """Load all enabled policies sorted by priority (ascending)."""
    return (
        db.query(Policy)
        .filter(Policy.enabled == True)
        .order_by(Policy.priority.asc())
        .all()
    )


def _matches_action_type(policy_action_types: List[str], action_type: str) -> bool:
    """Check if the action type matches the policy's list. '*' matches everything."""
    if not policy_action_types:
        return True
    for pat in policy_action_types:
        if pat == "*" or pat.lower() == action_type.lower():
            return True
    return False


def _matches_target(policy_patterns: List[str], target_resource: str) -> bool:
    """Check if target_resource matches any of the policy's regex patterns."""
    if not policy_patterns:
        return True
    for pattern in policy_patterns:
        try:
            if re.search(pattern, target_resource, re.IGNORECASE):
                return True
        except re.error:
            # Invalid regex — skip this pattern
            continue
    return False


def evaluate(
    action_type: str,
    target_resource: str,
    db: Session
) -> Tuple[str, List[str], int]:
    """
    Evaluate action_type + target_resource against all enabled policies.

    Returns:
        (decision, matched_policy_names, total_risk_modifier)
        decision: "ALLOW" | "HUMAN_APPROVAL" | "BLOCK"
    """
    policies = _load_policies(db)
    matched_names: List[str] = []
    total_modifier: int = 0

    for policy in policies:
        action_types = json.loads(policy.action_types or "[]")
        target_patterns = json.loads(policy.target_patterns or '[".*"]')

        if _matches_action_type(action_types, action_type) and \
           _matches_target(target_patterns, target_resource):
            matched_names.append(policy.name)
            total_modifier += policy.risk_modifier
            # First matching policy wins
            return policy.decision, matched_names, total_modifier

    # No policy matched → default ALLOW
    return "ALLOW", [], 0


def get_default_policies() -> List[dict]:
    """Return the 12 default policies for seeding."""
    return [
        {
            "name": "Block Credential Access",
            "description": "Prevents agents from reading files containing credentials, secrets, or private keys.",
            "action_types": ["read_file", "execute", "file_operation"],
            "target_patterns": [
                r".*password.*",
                r".*secret.*",
                r".*credential.*",
                r".*\.env$",
                r".*private.*key.*",
                r".*id_rsa.*"
            ],
            "decision": "BLOCK",
            "risk_modifier": 50,
            "enabled": True,
            "priority": 10,
        },
        {
            "name": "Block Database Destruction",
            "description": "Blocks DROP TABLE, DELETE FROM all rows, and TRUNCATE queries.",
            "action_types": ["db_query"],
            "target_patterns": [
                r".*DROP\s+TABLE.*",
                r".*DROP\s+DATABASE.*",
                r".*DELETE\s+FROM\s+\w+\s*;",
                r".*TRUNCATE.*"
            ],
            "decision": "BLOCK",
            "risk_modifier": 50,
            "enabled": True,
            "priority": 10,
        },
        {
            "name": "Block Privilege Escalation",
            "description": "Blocks attempts to gain elevated system privileges.",
            "action_types": ["execute", "system_call"],
            "target_patterns": [
                r".*sudo\s+.*",
                r".*chmod\s+777.*",
                r".*chown\s+root.*",
                r".*su\s+-.*",
                r".*setuid.*"
            ],
            "decision": "BLOCK",
            "risk_modifier": 50,
            "enabled": True,
            "priority": 10,
        },
        {
            "name": "Block Data Exfiltration",
            "description": "Blocks HTTP requests to known exfiltration endpoints.",
            "action_types": ["http_request"],
            "target_patterns": [
                r".*pastebin\.com.*",
                r".*ngrok\.io.*",
                r".*requestbin.*",
                r".*webhook\.site.*",
                r".*exfil.*"
            ],
            "decision": "BLOCK",
            "risk_modifier": 50,
            "enabled": True,
            "priority": 15,
        },
        {
            "name": "Require Approval for Production Deployments",
            "description": "Any deployment targeting production environments requires human review.",
            "action_types": ["deploy"],
            "target_patterns": [
                r".*prod.*",
                r".*production.*",
                r".*live.*"
            ],
            "decision": "HUMAN_APPROVAL",
            "risk_modifier": 30,
            "enabled": True,
            "priority": 20,
        },
        {
            "name": "Require Approval for Financial Transactions",
            "description": "All financial transactions require explicit human authorization.",
            "action_types": ["financial_transaction"],
            "target_patterns": [r".*"],
            "decision": "HUMAN_APPROVAL",
            "risk_modifier": 40,
            "enabled": True,
            "priority": 20,
        },
        {
            "name": "Require Approval for Mass Data Operations",
            "description": "Bulk database operations or wildcard file operations need human review.",
            "action_types": ["db_query", "file_operation"],
            "target_patterns": [
                r".*\*.*",
                r".*ALL\s+.*",
                r".*bulk.*",
                r".*mass.*"
            ],
            "decision": "HUMAN_APPROVAL",
            "risk_modifier": 25,
            "enabled": True,
            "priority": 25,
        },
        {
            "name": "Require Approval for Third-Party Payment APIs",
            "description": "Calls to Stripe, PayPal, or other payment processors need approval.",
            "action_types": ["http_request"],
            "target_patterns": [
                r".*api\.stripe\.com.*",
                r".*paypal\.com.*",
                r".*braintreepayments\.com.*",
                r".*twilio\.com.*",
                r".*sendgrid\..*"
            ],
            "decision": "HUMAN_APPROVAL",
            "risk_modifier": 20,
            "enabled": True,
            "priority": 30,
        },
        {
            "name": "Allow Read-Only Database Queries",
            "description": "SELECT queries on the database are generally safe to allow.",
            "action_types": ["db_query"],
            "target_patterns": [r"^SELECT\s+.*"],
            "decision": "ALLOW",
            "risk_modifier": -10,
            "enabled": True,
            "priority": 40,
        },
        {
            "name": "Allow Internal HTTP Requests",
            "description": "HTTP calls to localhost or internal network addresses are permitted.",
            "action_types": ["http_request"],
            "target_patterns": [
                r".*localhost.*",
                r".*127\.0\.0\.1.*",
                r".*192\.168\..*",
                r".*10\.0\..*"
            ],
            "decision": "ALLOW",
            "risk_modifier": -10,
            "enabled": True,
            "priority": 40,
        },
        {
            "name": "Allow Safe File Reads",
            "description": "Reading non-sensitive document files (txt, md, json, csv, log) is permitted.",
            "action_types": ["read_file"],
            "target_patterns": [
                r".*\.(txt|md|json|csv|log|yaml|yml)$"
            ],
            "decision": "ALLOW",
            "risk_modifier": -5,
            "enabled": True,
            "priority": 50,
        },
        {
            "name": "Default Allow",
            "description": "Catch-all policy that permits any action not matched by higher-priority rules.",
            "action_types": ["*"],
            "target_patterns": [r".*"],
            "decision": "ALLOW",
            "risk_modifier": 0,
            "enabled": True,
            "priority": 100,
        },
    ]
