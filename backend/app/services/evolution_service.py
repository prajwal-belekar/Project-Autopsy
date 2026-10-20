from typing import Dict, Any, List, Optional
from app.services.repository_service import RepositoryService
from app.engines.evolution_engine import EvolutionEngine


class EvolutionService:
    """Repository evolution timeline with time-aware period comparison."""

    def __init__(self):
        self.repository_service = RepositoryService()
        self.evolution_engine = EvolutionEngine()

    async def get_evolution(self, repository_id: str) -> Dict[str, Any]:
        """Get evolution timeline derived from actual repository monthly activity data."""
        repo_data = await self.repository_service.get_repository(repository_id)
        if not repo_data:
            return {
                "events": [],
                "note": "No repository data available.",
                "time_analysis": {
                    "trend": {"stable"},
                    "deltas": {"complexity": 0, "churn": 0, "bug_fixes": 0, "reverts": 0, "testing": 0, "friction": 0},
                    "attention_required": False,
                }
            }

        monthly = repo_data.get("monthly", [])
        if not monthly:
            return {
                "events": [],
                "note": "No monthly activity data available.",
                "time_analysis": {
                    "trend": {"stable"},
                    "deltas": {"complexity": 0, "churn": 0, "bug_fixes": 0, "reverts": 0, "testing": 0, "friction": 0},
                    "attention_required": False,
                }
            }

        # Run the evolution engine over the actual monthly data
        comparison = self.evolution_engine.build_repository_period_metrics(monthly, split_index=len(monthly) // 2)

        # Build events from the monthly data
        events = []
        for i, month in enumerate(monthly, 1):
            events.append(
                {
                    "id": f"ev-{i}",
                    "month": month.get("month", f"2026-{i:02d}"),
                    "date": f"2026-{i:02d}-15T00:00:00Z",
                    "title": f"Activity period {i}",
                    "description": f"{month.get('commits', 0)} commits, {month.get('churn', 0)} churn, {month.get('bug_fixes', 0)} bug fixes.",
                    "commits": month.get("commits", 0),
                    "filesChanged": round(month.get("churn", 0) / 100),
                    "modules": ["src/auth", "src/payments"],  # would need module detection
                    "issues": month.get("bug_fixes", 0),
                    "prs": 2,  # placeholder
                    "complexityChange": month.get("complexity", 0),
                    "frictionChange": 0,  # would need friction per period
                    "evidenceLink": {"label": "View history", "to": "/repository/placeholder/git"},
                }
            )

        return {
            "events": events,
            "note": comparison.get("summary", "No significant change observed."),
            "time_analysis": {
                "trend": comparison.get("trend", {}),
                "deltas": comparison.get("deltas", {}),
                "attention_required": comparison.get("attention_required", False),
            },
        }