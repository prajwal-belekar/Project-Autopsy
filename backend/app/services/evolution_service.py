from typing import Dict, Any
from app.services.evidence_analysis_service import EvidenceAnalysisService
from app.data.synthetic_repo import SYNTHETIC_MONTHLY


class EvolutionService:
    """Repository evolution timeline with time-aware period comparison."""

    def __init__(self):
        self.evidence_service = EvidenceAnalysisService()

    async def get_evolution(self, repository_id: str) -> Dict[str, Any]:
        split_index = max(1, len(SYNTHETIC_MONTHLY) // 2)
        comparison = self.evidence_service.analyze_evolution(SYNTHETIC_MONTHLY, split_index)

        events = []
        for i, month in enumerate(SYNTHETIC_MONTHLY, 1):
            events.append({
                "id": f"ev-{i}",
                "month": f"2026-{i:02d}",
                "date": f"2026-{i:02d}-15T00:00:00Z",
                "title": f"Activity period {i}",
                "description": f"{month['commits']} commits, {month['churn']} churn, "
                               f"{month['bug_fixes']} bug fixes.",
                "commits": month["commits"],
                "filesChanged": round(month["churn"] / 100),
                "modules": ["src/auth", "src/payments"],
                "issues": month["bug_fixes"],
                "prs": 2,
                "complexityChange": month["complexity"],
                "frictionChange": month["friction"],
                "evidenceLink": {"label": "View history", "to": "/repository/placeholder/git"},
            })

        return {
            "events": events,
            "note": comparison["summary"],
            "time_analysis": {
                "trend": comparison["trend"],
                "deltas": comparison["deltas"],
                "attention_required": comparison["attention_required"],
            },
        }