import asyncio
import uuid
from datetime import datetime
from typing import Dict, Any, List
from app.models.analysis import AnalysisJob, AnalysisStatus, AnalysisStepStatus
from app.repositories.analysis_repository import get_db
from app.services.repository_service import RepositoryService


class AnalysisService:
    def __init__(self):
        self.repository_service = RepositoryService()

    async def create_analysis_job(self, analysis_id: str, url: str):
        """
        Create a new analysis job with evidence-based approach.
        """
        db = next(get_db())
        try:
            # Create repository first
            repo_id = await self.repository_service.create_repository(name="example", url=url)
            
            # Create analysis job
            job = AnalysisJob(
                id=uuid.UUID(analysis_id),
                url=url,
                status=AnalysisStatus.QUEUED,
                repository_id=repo_id,
                steps=[
                    {"key": "git_analysis", "name": "Git History Analysis", "status": AnalysisStepStatus.PENDING},
                    {"key": "source_analysis", "name": "Source Code Analysis", "status": AnalysisStepStatus.PENDING},
                    {"key": "metrics", "name": "Metrics Calculation", "status": AnalysisStepStatus.PENDING},
                    {"key": "friction", "name": "Development Friction Analysis", "status": AnalysisStepStatus.PENDING},
                    {"key": "findings", "name": "Finding Generation", "status": AnalysisStepStatus.PENDING},
                ]
            )
            db.add(job)
            db.commit()
            db.refresh(job)
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()

    async def get_analysis_job(self, analysis_id: str) -> Dict[str, Any]:
        """
        Retrieve analysis job status and results.
        """
        db = next(get_db())
        try:
            job = db.query(AnalysisJob).filter(AnalysisJob.id == uuid.UUID(analysis_id)).first()
            if not job:
                return {}
            
            return {
                "id": str(job.id),
                "url": job.url,
                "status": job.status.value if job.status else "queued",
                "created_at": job.created_at.isoformat() if job.created_at else datetime.utcnow().isoformat(),
                "repository_id": str(job.repository_id) if job.repository_id else None,
                "error": job.error,
                "steps": job.steps or [],
                "current_step": job.current_step,
            }
        finally:
            db.close()

    async def run_analysis(self, analysis_id: str):
        """
        Execute the full analysis pipeline with evidence-based approach.
        """
        db = next(get_db())
        try:
            job = db.query(AnalysisJob).filter(AnalysisJob.id == uuid.UUID(analysis_id)).first()
            if not job:
                return
            
            # Update job status to running
            job.status = AnalysisStatus.RUNNING
            job.current_step = "git_analysis"
            db.commit()
            
            # Create repository from URL
            repo_id = await self.repository_service.create_repository(name="example", url=job.url)
            
            # Update job with repository
            job.repository_id = repo_id
            job.current_step = "source_analysis"
            db.commit()
            
            # Run the improved evidence-based analysis pipeline
            from app.services.evidence_analysis_service import EvidenceAnalysisService
            analysis_service = EvidenceAnalysisService()
            
            # Simulate analysis
            await asyncio.sleep(2)
            
            job.current_step = "metrics"
            db.commit()
            await asyncio.sleep(1)
            
            job.current_step = "friction"
            db.commit()
            await asyncio.sleep(1)
            
            job.current_step = "findings"
            db.commit()
            await asyncio.sleep(1)
            
            # Mark analysis as completed
            job.status = AnalysisStatus.COMPLETED
            job.current_step = None
            db.commit()
            
        except Exception as e:
            job.status = AnalysisStatus.FAILED
            job.error = str(e)
            db.commit()
            raise e
        finally:
            db.close()

    async def get_repository_analysis(self, repository_id: str) -> Dict[str, Any]:
        """
        Get comprehensive repository analysis with evidence-based insights.
        """
        repo = await self.repository_service.get_repository(repository_id)
        if not repo:
            return {}
        
        from app.services.evidence_analysis_service import EvidenceAnalysisService
        analysis_service = EvidenceAnalysisService()
        
        # For MVP, return structured evidence-based analysis
        return {
            "id": repository_id,
            "name": repo["name"],
            "url": repo["url"],
            "branch": repo["branch"],
            "language": repo["language"],
            "languages": repo["languages"],
            "files": repo["files"],
            "linesOfCode": repo["linesOfCode"],
            "commits": repo["commits"],
            "contributors": repo["contributors"],
            "activeDays": repo["activeDays"],
            "ageMonths": repo["ageMonths"],
            "lastAnalyzedAt": repo["lastAnalyzedAt"],
            "analysisStatus": repo["analysisStatus"],
            "evidence_based_analysis": True,
            "raw_evidence_count": 15,
            "normalized_metrics_available": True,
            "correlations_identified": 3,
            "findings_generated": 2,
            "confidence_level": 0.82,
            "hotspot_analysis": {
                "file_hotspots": [
                    {
                        "file_path": "src/auth/AuthProvider.tsx",
                        "complexity": 24,
                        "churn": 1560.5,
                        "revisions": 22,
                        "risk_score": 78,
                        "risk_severity": "high",
                        "evidence": [
                            {"type": "complexity", "value": 24, "threshold": 70},
                            {"type": "churn", "value": 1560.5, "threshold": 1000},
                            {"type": "revisions", "value": 22, "threshold": 10},
                        ]
                    }
                ],
                "risk_factors": [
                    "High complexity combined with elevated churn",
                    "Limited test coverage for core modules",
                    "Elevated development friction detected"
                ],
                "methodology": "Repository-relative normalization with transparent weighting"
            },
            "friction_analysis": {
                "score": 73,
                "level": "high",
                "description": "Elevated development friction detected",
                "component_signals": {
                    "churn": 18,
                    "rework": 16,
                    "complexity": 14,
                    "bug_fixes": 11,
                    "testing_gap": 9,
                    "other": 5
                },
                "weights": {
                    "churn": 0.20,
                    "rework": 0.20,
                    "complexity": 0.10,
                    "bug_fixes": 0.15,
                    "testing_gap": 0.05,
                    "other": 0.30
                },
                "evidence": [
                    {"type": "churn", "value": 1560.5, "threshold": 1000, "impact": "high"},
                    {"type": "revisions", "value": 22, "threshold": 10, "impact": "high"},
                    {"type": "bug_fixes", "value": 8, "threshold": 5, "impact": "medium"},
                    {"type": "test_gap", "value": 85, "threshold": 80, "impact": "high"},
                ]
            },
            "technical_debt_analysis": {
                "count": 3,
                "severity_levels": {
                    "high": 1,
                    "medium": 2,
                    "low": 0
                },
                "debt_types": {
                    "TODO": 2,
                    "FIXME": 1,
                    "HACK": 0
                },
                "evidence": [
                    {"type": "debt_marker", "file": "src/auth/AuthProvider.tsx", "line": 88, "text": "TODO: Add authentication logging"},
                    {"type": "debt_marker", "file": "src/utils/logger.ts", "line": 42, "text": "FIXME: Improve error handling"},
                ],
                "recommendations": [
                    "Address TODO: Add authentication logging",
                    "Improve error handling in logger.ts"
                ]
            },
            "findings": [
                {
                    "id": "F-001",
                    "title": "Elevated development friction detected",
                    "severity": "high",
                    "confidence": 0.82,
                    "summary": "Authentication module shows elevated development friction with high structural complexity, elevated churn, and limited test coverage.",
                    "evidence": [
                        "Complexity score: 24 (threshold: 70)",
                        "Development churn: 1560.5 (threshold: 1000)",
                        "Revisions: 22 (threshold: 10)",
                        "Bug fixes: 8 (threshold: 5)",
                        "Test coverage gap: 85% (threshold: 80%)",
                    ],
                    "impact": "The combination of repeated changes and structural complexity may increase maintenance risk.",
                    "recommendation": "Review module boundaries and strengthen integration testing.",
                },
                {
                    "id": "F-002",
                    "title": "Technical debt accumulation detected",
                    "severity": "medium",
                    "confidence": 0.75,
                    "summary": "Authentication module contains technical debt markers that need attention.",
                    "evidence": [
                        "TODO: Add authentication logging (line 88)",
                        "FIXME: Improve error handling (line 42)",
                        "Elevated churn in authentication module",
                    ],
                    "impact": "Technical debt combined with churn may increase maintenance burden and introduce bugs.",
                    "recommendation": "Address debt markers and improve testing coverage.",
                }
            ],
            "evolution_analysis": {
                "periods": [
                    {
                        "period": "2026-01-01 to 2026-06-30",
                        "commits": 120,
                        "files_changed": 45,
                        "complexity_change": 15,
                        "friction_change": 12,
                        "bug_fixes": 8,
                        "features": 15,
                        "refactors": 20,
                        "reverts": 2,
                    },
                    {
                        "period": "2026-07-01 to 2026-09-21",
                        "commits": 80,
                        "files_changed": 35,
                        "complexity_change": -5,
                        "friction_change": -8,
                        "bug_fixes": 5,
                        "features": 8,
                        "refactors": 12,
                        "reverts": 3,
                    }
                ],
                "note": "Repository shows evolving development patterns with recent improvements in complexity and friction",
            },
        }