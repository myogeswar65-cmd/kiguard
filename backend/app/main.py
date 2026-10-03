import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, SessionLocal, Base
from app.routers import gateway, policies, agents, approvals, audit_logs, dashboard

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="KiGuard API",
    description="AI Agent Permission & Safety Gateway",
    version="1.0.0",
)

# CORS — allow frontend on :3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(gateway.router)
app.include_router(policies.router)
app.include_router(agents.router)
app.include_router(approvals.router)
app.include_router(audit_logs.router)
app.include_router(dashboard.router)


@app.on_event("startup")
def startup_seed():
    """Seed demo data on first start."""
    db = SessionLocal()
    try:
        from app.seed import seed_db
        seed_db(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "name": "KiGuard",
        "version": "1.0.0",
        "description": "AI Agent Permission & Safety Gateway",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
