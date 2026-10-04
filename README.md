# 🛡️ KiGuard

### AI Agent Permission & Safety Gateway

KiGuard is an AI Agent Security Gateway designed to monitor, evaluate, and control actions performed by autonomous AI agents before those actions reach sensitive resources.

As AI agents become capable of accessing files, databases, APIs, financial systems, and production infrastructure, organizations need a reliable mechanism to control what agents are allowed to do.

KiGuard acts as a security and governance layer between AI agents and real-world actions.

---

## 🚀 Overview

Modern AI agents can perform powerful actions such as:

- Reading sensitive files
- Executing system commands
- Querying databases
- Accessing external APIs
- Deploying applications
- Performing financial operations
- Transferring or exporting data

Without proper controls, an AI agent may unintentionally or maliciously perform high-risk actions.

KiGuard evaluates these requests using configurable security policies and risk scoring before those actions are allowed to proceed.

### Core Decision Flow

```text
AI Agent
   │
   ▼
Action Request
   │
   ▼
┌─────────────────────────┐
│        KiGuard          │
│    Security Gateway     │
├─────────────────────────┤
│ Policy Evaluation       │
│ Risk Assessment         │
│ Agent Verification      │
│ Resource Evaluation     │
└────────────┬────────────┘
             │
      ┌──────┼──────────┐
      ▼      ▼          ▼
   ALLOW   BLOCK   HUMAN APPROVAL
      │      │          │
      └──────┴──────────┘
             │
             ▼
        Audit Logging


✨ Key Features
🔐 AI Agent Governance
Register and manage AI agents with information such as:
Agent name
Agent type
Status
Risk level
Permissions
Activity
🛡️ Policy-Based Access Control
KiGuard supports configurable policies that determine how agents should behave.
Example policies include:
Block credential access
Block database destruction
Block sensitive data exfiltration
Require approval for financial transactions
Require approval for production deployments
Require approval for mass data operations
Policies can be created, updated, enabled, or disabled.
⚠️ Risk Assessment
Every incoming action can be evaluated using a risk score.
Example:
Risk Score: 92
Risk Level: CRITICAL
Decision: BLOCK
Risk Levels
Risk Score
Risk Level
0–24
LOW
25–49
MEDIUM
50–74
HIGH
75–100
CRITICAL
🚦 Intelligent Action Decisions
KiGuard produces three primary decisions.
✅ ALLOW
The requested action is considered safe and can proceed.
🚫 BLOCK
The action violates security policies or exceeds an acceptable risk threshold.
👤 HUMAN APPROVAL
The action may be legitimate but requires human authorization before execution.
This provides a human-in-the-loop security mechanism for sensitive operations.
👤 Human Approval Workflow
High-impact operations can be placed into an approval queue.
Authorized users can:
Review the request
Inspect the agent
View the target resource
Check risk score
Review matched policies
Approve the action
Reject the action
📋 Audit Logging
KiGuard maintains an audit trail of agent activities.
Each event can include:
Request ID
Agent name
Action type
Target resource
Risk score
Risk level
Decision
Matched policies
Timestamp
Example:
{
  "agent_name": "ResearchBot-Alpha",
  "action_type": "read_file",
  "target_resource": "/home/user/.env",
  "decision": "BLOCK",
  "risk_score": 85,
  "risk_level": "CRITICAL",
  "matched_policies": [
    "Block Credential Access"
  ]
}
📊 Security Dashboard
The KiGuard dashboard provides a centralized view of security activity.
It displays:
Total requests
Allowed requests
Blocked requests
Human approval requests
Pending approvals
High-risk requests
Critical-risk requests
Active agents
Active policies
Recent security activity
Example dashboard metrics:
Total Requests       15
Allowed               5
Blocked               7
Human Approval        3
Active Agents         4
Active Policies      12
Critical Risk         8
🏗️ System Architecture
                    ┌──────────────────┐
                    │    AI Agents     │
                    └────────┬─────────┘
                             │
                             │ Action Request
                             ▼
                 ┌────────────────────────┐
                 │        KiGuard         │
                 │    Security Gateway    │
                 └───────────┬────────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
      ┌────────────┐  ┌────────────┐  ┌─────────────┐
      │   Agent    │  │  Policy    │  │    Risk     │
      │ Management │  │ Evaluation │  │  Assessment │
      └────────────┘  └────────────┘  └─────────────┘
             │               │               │
             └───────────────┼───────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Decision Engine │
                    └────────┬────────┘
                             │
                ┌────────────┼────────────┐
                ▼            ▼            ▼
             ALLOW         BLOCK       APPROVAL
                │            │            │
                └────────────┼────────────┘
                             ▼
                    ┌─────────────────┐
                    │  Audit Logging  │
                    └─────────────────┘
🧰 Technology Stack
Frontend
Next.js
React
TypeScript
Tailwind CSS
Lucide Icons
Backend
Python
FastAPI
SQLAlchemy
Pydantic
Mangum
Database
SQLAlchemy
SQLite for local development
Deployment
GitHub
Vercel
📁 Project Structure
kiguard/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── seed.py
│   │   │
│   │   ├── routers/
│   │   │   ├── agents.py
│   │   │   ├── policies.py
│   │   │   ├── approvals.py
│   │   │   ├── audit_logs.py
│   │   │   ├── dashboard.py
│   │   │   └── gateway.py
│   │   │
│   │   └── ...
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   │       └── api.ts
│   │
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md


🔌 API Architecture
The backend exposes REST APIs for the frontend and external AI-agent integrations.
Dashboard
GET /api/dashboard/stats
Returns dashboard statistics and recent activity.
Agents
GET    /api/agents
POST   /api/agents
PUT    /api/agents/{id}
DELETE /api/agents/{id}
Used to manage registered AI agents.
Policies
GET    /api/policies
POST   /api/policies
PUT    /api/policies/{id}
PATCH  /api/policies/{id}
DELETE /api/policies/{id}
Used to manage security policies.
Gateway
POST /api/gateway/evaluate
Evaluates an AI-agent action and determines whether it should be:
ALLOW
BLOCK
HUMAN_APPROVAL
Approvals
GET  /api/approvals
POST /api/approvals/{id}/approve
POST /api/approvals/{id}/reject
Used for human-in-the-loop authorization.
Audit Logs
GET /api/audit-logs
Returns recorded security events.
⚙️ Local Installation
Prerequisites
Make sure the following are installed:
Python 3.10+
Node.js 18+
npm
Git
1️⃣ Clone the Repository
git clone https://github.com/myogeswar65-cmd/kiguard.git
cd kiguard
2️⃣ Setup Backend
Navigate to the backend:
cd backend
Create a virtual environment:
Windows
python -m venv venv
Activate it:
venv\Scripts\activate
Install dependencies:
pip install -r requirements.txt
Start FastAPI:
uvicorn app.main:app --reload
Backend:
http://localhost:8000
FastAPI Swagger documentation:
http://localhost:8000/docs
3️⃣ Setup Frontend
Open another terminal.
From the project root:
cd frontend
Install dependencies:
npm install
Create:
frontend/.env.local
Add:
NEXT_PUBLIC_API_URL=http://localhost:8000
Start the development server:
npm run dev
Frontend:
http://localhost:3000
🔄 Local Development Flow
Browser
   │
   ▼
Next.js
localhost:3000
   │
   │ REST API
   ▼
FastAPI
localhost:8000
   │
   ▼
Database
Open:
http://localhost:3000
🧪 Example Gateway Request
An AI agent can send an action to the gateway:
{
  "agent_id": 1,
  "action_type": "read_file",
  "target_resource": "/home/user/.env"
}
KiGuard evaluates the request against configured policies and risk rules.
Example response:
{
  "decision": "BLOCK",
  "risk_score": 85,
  "risk_level": "CRITICAL",
  "matched_policies": [
    "Block Credential Access"
  ]
}
🔐 Security Model
KiGuard follows a policy-driven security approach.
The core principle is:
AI agents should not automatically receive unrestricted authority to access sensitive resources or perform consequential actions.
Instead, actions are evaluated before execution.
Security Controls
Agent identity
Action classification
Resource evaluation
Policy matching
Risk scoring
Human approval
Automatic blocking
Audit logging
🎯 Example Use Cases
1. Credential Protection
An AI agent attempts to read:
/home/user/.env
KiGuard identifies the request as sensitive.
Risk: CRITICAL
Decision: BLOCK
2. Database Protection
An agent attempts:
DROP TABLE users;
KiGuard detects a destructive database operation.
Risk: CRITICAL
Decision: BLOCK
3. Financial Transactions
An AI agent attempts to perform a payment operation.
Instead of automatically allowing it:
Decision: HUMAN_APPROVAL
A human can review and authorize the operation.
4. Production Deployment
An agent attempts to deploy to production.
KiGuard can require human authorization before allowing the deployment.
5. Data Exfiltration
An agent attempts to send sensitive data to an external service.
The request can be identified and blocked using a data-exfiltration policy.
🧠 Design Philosophy
KiGuard follows a simple security principle:
Observe → Evaluate → Decide → Authorize → Audit
The system is designed around the principle of least privilege for AI agents.
Agents should receive only the authority required to perform their intended tasks.

🛠️ Development
Run backend:
cd backend
uvicorn app.main:app --reload
Run frontend:
cd frontend
npm run dev
Build frontend:
npm run build
Run production frontend locally:
npm start

👨‍💻 Author
Yogeswar Maddikuntla
