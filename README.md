# KiGuard — AI Agent Permission & Safety Gateway

> The Permission Layer for Autonomous AI Agents

KiGuard sits between AI agents and their tools, evaluating every action against configurable security policies and calculating a transparent risk score before deciding: **ALLOW**, **HUMAN_APPROVAL**, or **BLOCK**.

## Architecture

```
AI Agent → KiGuard Gateway API → Policy Engine → Risk Engine → Decision
                                                               ↓
                                                          Audit Log
                                                               ↓
                                                          Dashboard
```

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Lucide |
| Backend | FastAPI, Python 3.11, SQLAlchemy |
| Database | SQLite (auto-created) |
| Deploy | Vercel (frontend) + Railway (backend) |

## Features

- **Gateway API** — `POST /api/gateway/evaluate` returns ALLOW/HUMAN_APPROVAL/BLOCK with risk score
- **Policy Engine** — 12 default configurable policies, priority-ordered regex matching
- **Risk Engine** — Transparent 0–100 score with 5 factor breakdown
- **Human Approvals** — Pending queue with approve/reject workflow
- **Audit Logs** — Immutable log of every decision with filters
- **Security Demo** — 5 live attack scenarios with animated pipeline
- **Agent Registry** — Trust levels influence risk calculations

## Quick Start (Local)

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# → http://localhost:8000
# → http://localhost:8000/docs (Swagger UI)
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

## Deploy to Vercel + Railway

### Backend → Railway

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the repo, set **Root Directory** to `backend`
4. Add environment variable: `ALLOWED_ORIGINS=https://your-vercel-app.vercel.app`
5. Railway auto-detects Python and deploys. Copy the generated URL.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app`
4. Deploy

## API Example

```python
import requests

response = requests.post("https://your-railway-url.railway.app/api/gateway/evaluate", json={
    "agent_name": "my-agent",
    "action_type": "financial_transaction",
    "target_resource": "external_bank_account",
    "parameters": {"amount": 50000}
})

result = response.json()
print(result["decision"])    # BLOCK
print(result["risk_score"])  # 95
print(result["reason"])      # Blocked by 'Require Approval for Financial Transactions'...
```

## Demo Scenarios

| Scenario | Action | Expected |
|---|---|---|
| Safe read | `read_file` → `README.md` | ✅ ALLOW |
| SQL SELECT | `db_query` → `SELECT * FROM users` | ✅ ALLOW |
| Financial transfer | `financial_transaction` → external account | 🔴 BLOCK |
| DROP TABLE | `db_query` → `DROP TABLE users` | 🔴 BLOCK |
| Credential access | `read_file` → `.env` | 🔴 BLOCK |
| Production deploy | `deploy` → `production/api` | 🟡 HUMAN_APPROVAL |

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Vercel | Railway backend URL |
| `ALLOWED_ORIGINS` | Railway | Comma-separated allowed CORS origins |
| `SQLITE_PATH` | Railway | Path for SQLite DB (optional, uses Railway volume) |

## License

MIT — Built for hackathon demonstration purposes.
