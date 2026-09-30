from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.routes import analysis, repositories, code_health, git, friction, hotspots, architecture, debt, testing, documentation, issues, evolution, findings, files
from app.repositories.analysis_repository import init_db, get_db

setup_logging()

# Initialize database
init_db()

app = FastAPI(
    title="Project Autopsy API",
    description="Software Development Forensics & Engineering Intelligence Platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix=settings.API_PREFIX)
app.include_router(repositories.router, prefix=settings.API_PREFIX)
app.include_router(code_health.router, prefix=settings.API_PREFIX)
app.include_router(git.router, prefix=settings.API_PREFIX)
app.include_router(friction.router, prefix=settings.API_PREFIX)
app.include_router(hotspots.router, prefix=settings.API_PREFIX)
app.include_router(architecture.router, prefix=settings.API_PREFIX)
app.include_router(debt.router, prefix=settings.API_PREFIX)
app.include_router(testing.router, prefix=settings.API_PREFIX)
app.include_router(documentation.router, prefix=settings.API_PREFIX)
app.include_router(issues.router, prefix=settings.API_PREFIX)
app.include_router(evolution.router, prefix=settings.API_PREFIX)
app.include_router(findings.router, prefix=settings.API_PREFIX)
app.include_router(files.router, prefix=settings.API_PREFIX)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "project-autopsy"}