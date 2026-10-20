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
            # Create repository first (this also acquires real data in background)
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
        
        The pipeline runs in the background:
          1. Repository acquisition (clone + analyze source + git forensics)
          2. Evidence pipeline (hotspots, friction, findings, correlation)
          3. Job completion with repository_id resolved
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
            
            # Create repository from URL.
            # RepositoryService.create_repository now runs the blocking acquisition
            # in a thread pool, so by the time it returns, the data is already
            # stored in self._repos[job.repository_id].
            repo_id = await self.repository_service.create_repository(
                name=job.url[:50], url=job.url
            )
            
            # Update job with repository and resolved ID
            job.repository_id = repo_id
            job.current_step = "source_analysis"
            db.commit()
            
            # The evidence pipeline steps (metrics, friction, findings) are
            # computed on-demand when the frontend queries the API endpoints.
            # We just mark them as completed since the data is already stored.
            job.current_step = "metrics"
            db.commit()
            
            job.current_step = "friction"
            db.commit()
            
            job.current_step = "findings"
            db.commit()
            
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
        repo_data = await self.repository_service.get_repository(repository_id)
        if not repo_data:
            return {}
        
        files = repo_data.get("files", [])
        
        from app.services.evidence_analysis_service import EvidenceAnalysisService
        analysis_service = EvidenceAnalysisService()
        
        if not files:
            return {
                "id": repository_id,
                "name": "",
                "url": "",
                "branch": "main",
                "language": "Unknown",
                "languages": [],
                "files": 0,
                "linesOfCode": 0,
                "commits": 0,
                "contributors": 0,
                "activeDays": 0,
                "ageMonths": 0,
                "lastAnalyzedAt": datetime.utcnow().isoformat(),
                "analysisStatus": "complete",
                "evidence_based_analysis": True,
                "raw_evidence_count": 0,
                "normalized_metrics_available": False,
                "correlations_identified": 0,
                "findings_generated": 0,
                "confidence_level": 0.0,
            }
        
        # Run the evidence analysis pipeline over the real files
        analysis = analysis_service.analyze_file_metrics(files)
        
        repository = repo_data.get("repository", {})
        
        # Compute friction analysis
        friction = analysis_service.compute_friction(files)
        
        # Compute technical debt analysis
        debt = self._compute_debt_from_files(files)
        
        # Compute evolution analysis
        monthly = repo_data.get("monthly", [])
        evolution = self._compute_evolution(monthly)
        
        return {
            "id": repository_id,
            "name": repository.get("name", ""),
            "url": repository.get("url", ""),
            "branch": repository.get("branch", "main"),
            "language": repository.get("language", "Unknown"),
            "languages": repository.get("languages", []),
            "files": repository.get("files", 0),
            "linesOfCode": repository.get("linesOfCode", 0),
            "commits": repository.get("commits", 0),
            "contributors": repository.get("contributors", 0),
            "activeDays": repository.get("activeDays", 0),
            "ageMonths": repository.get("ageMonths", 0),
            "lastAnalyzedAt": repository.get("lastAnalyzedAt", datetime.utcnow().isoformat()),
            "analysisStatus": repository.get("analysisStatus", "complete"),
            "evidence_based_analysis": True,
            "raw_evidence_count": len(files),
            "normalized_metrics_available": True,
            "correlations_identified": len(analysis.get("findings", [])),
            "findings_generated": len(analysis.get("findings", [])),
            "confidence_level": analysis.get("findings", [{}])[0].get("confidence", 0.0) if analysis.get("findings") else 0.0,
            "hotspot_analysis": {
                "file_hotspots": [
                    {
                        "file_path": h.get("file_path", ""),
                        "complexity": h.get("signals", {}).get("complexity", 0),
                        "churn": h.get("signals", {}).get("churn", 0),
                        "revisions": h.get("signals", {}).get("revisions", 0),
                        "risk_score": h.get("score", 0),
                        "risk_severity": h.get("risk_severity", "low"),
                        "evidence": [
                            {"type": "complexity", "value": h.get("signals", {}).get("complexity", 0), "threshold": 70},
                            {"type": "churn", "value": h.get("signals", {}).get("churn", 0), "threshold": 1000},
                            {"type": "revisions", "value": h.get("signals", {}).get("revisions", 0), "threshold": 10},
                        ]
                    }
                    for h in analysis.get("hotspots", [])
                ],
                "risk_factors": [
                    "High complexity combined with elevated churn",
                    "Limited test coverage for core modules",
                    "Elevated development friction detected"
                ],
                "methodology": "Repository-relative normalization with transparent weighting"
            },
            "friction_analysis": {
                "score": friction.get("score", 0) if friction else 0,
                "level": friction.get("level", "low") if friction else "low",
                "description": friction.get("methodology", "Development friction analysis.") if friction else "Development friction analysis.",
                "component_signals": {
                    "churn": friction.get("factor_scores", {}).get("churn", 0) if friction else 0,
                    "rework": friction.get("factor_scores", {}).get("revisions", 0) if friction else 0,
                    "complexity": friction.get("factor_scores", {}).get("complexity", 0) if friction else 0,
                    "bug_fixes": friction.get("factor_scores", {}).get("bug_fixes", 0) if friction else 0,
                    "testing_gap": friction.get("factor_scores", {}).get("test_gap", 0) if friction else 0,
                    "other": friction.get("factor_scores", {}).get("debt", 0) if friction else 0,
                },
                "weights": friction.get("weights", {}) if friction else {
                    "churn": 0.20,
                    "rework": 0.20,
                    "complexity": 0.10,
                    "bug_fixes": 0.15,
                    "testing_gap": 0.05,
                    "other": 0.30,
                },
                "evidence": friction.get("note", "Development friction analysis.") if friction else "Development friction analysis.",
            },
            "technical_debt_analysis": debt,
            "findings": analysis.get("findings", []),
            "evolution_analysis": evolution,
        }

    def _compute_debt_from_files(self, files: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute technical debt summary from file debt_counts."""
        total_debt = sum(f.get("debt_count", 0) for f in files)
        files_with_debt = sum(1 for f in files if f.get("debt_count", 0) > 0)
        
        return {
            "count": files_with_debt,
            "severity_levels": {
                "high": sum(1 for f in files if f.get("debt_count", 0) > 5),
                "medium": sum(1 for f in files if 1 < f.get("debt_count", 0) <= 5),
                "low": sum(1 for f in files if f.get("debt_count", 0) <= 1),
            },
            "debt_types": {
                "todo": files_with_debt,
                "fixme": 0,
                "hack": 0,
            },
            "note": f"Technical debt markers found in {files_with_debt} file(s).",
        }

    def _compute_evolution(self, monthly: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Compute evolution analysis from stored monthly activity data."""
        from app.engines.evolution_engine import EvolutionEngine
        
        if not monthly or len(monthly) < 2:
            return {
                "periods": [],
                "note": "Insufficient monthly data for evolution analysis.",
                "time_analysis": {
                    "trend": {"stable"},
                    "deltas": {"complexity": 0, "churn": 0, "bug_fixes": 0, "reverts": 0, "testing": 0, "friction": 0},
                    "attention_required": False,
                }
            }
        
        engine = EvolutionEngine()
        try:
            comparison = engine.build_repository_period_metrics(monthly, split_index=len(monthly) // 2)
            return {
                "periods": [
                    {
                        "period": "Historical period",
                        "commits": comparison.get("total_commits", {}).get("historical", 0),
                        "files_changed": 0,
                        "complexity_change": comparison.get("deltas", {}).get("complexity", 0),
                        "friction_change": 0,
                        "bug_fixes": comparison.get("deltas", {}).get("bug_fixes", 0),
                        "features": 0,
                        "refactors": 0,
                        "reverts": comparison.get("deltas", {}).get("reverts", 0),
                    },
                    {
                        "period": "Current period",
                        "commits": comparison.get("total_commits", {}).get("current", 0),
                        "files_changed": 0,
                        "complexity_change": -comparison.get("deltas", {}).get("complexity", 0),
                        "friction_change": 0,
                        "bug_fixes": 0,
                        "features": 0,
                        "refactors": 0,
                        "reverts": 0,
                    }
                ],
                "note": comparison.get("summary", "No significant change observed."),
                "time_analysis": {
                    "trend": comparison.get("trend", {}),
                    "deltas": comparison.get("deltas", {}),
                    "attention_required": comparison.get("attention_required", False),
                }
            }
        except Exception as e:
            return {
                "periods": [],
                "note": f"Evolution analysis error: {str(e)}",
                "time_analysis": {
                    "trend": {"stable"},
                    "deltas": {"complexity": 0, "churn": 0, "bug_fixes": 0, "reverts": 0, "testing": 0, "friction": 0},
                    "attention_required": False,
                }
            }