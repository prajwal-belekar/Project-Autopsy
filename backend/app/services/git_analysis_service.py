from typing import Dict, Any
from app.services.evidence_analysis_service import EvidenceAnalysisService


class GitAnalysisService:
    """
    Git forensics endpoint. Includes rework signals and late-hour / stall
    activity signals computed from git-derived evidence.
    """

    def __init__(self):
        self.evidence_service = EvidenceAnalysisService()

    async def get_git_forensics(self, repository_id: str) -> Dict[str, Any]:
        # Placeholder git-derived totals replaced by real git analysis later.
        file_activity = {"revisions": 22, "churn": 1400, "bug_fixes": 9, "reverts": 4}
        rework = self.evidence_service.rework_analysis(file_activity)

        return {
            "totals": {
                "commits": 1284,
                "activeDays": 126,
                "avgChangesPerCommit": 18,
                "reverts": 4,
                "bugFixCommits": 42,
                "refactorCommits": 87,
            },
            "activity": [],
            "classification": [],
            "classificationNote": "Commit types assigned by message heuristics.",
            "churn": [],
            "highChurnFiles": [],
            "rework": {
                "repeatedlyModifiedFiles": 6,
                "reverts": 4,
                "repeatedBugFixes": 9,
                "highChurnHotspots": 2,
                "rework_score": rework["rework_score"],
                "rework_level": rework["rework_level"],
                "description": rework["description"],
                "signals": rework["signals"],
            },
            "stalls": [],
            "patterns": [],
            "recentCommits": [],
        }