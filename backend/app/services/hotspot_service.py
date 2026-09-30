from typing import Dict, Any, List, Optional
from app.services.evidence_analysis_service import EvidenceAnalysisService
from app.data.synthetic_repo import SYNTHETIC_FILES


class HotspotService:
    """Sortable, evidence-backed list of hotspot files."""

    def __init__(self):
        self.evidence_service = EvidenceAnalysisService()

    async def get_hotspots(self, repository_id: str) -> Optional[List[Dict[str, Any]]]:
        result = self.evidence_service.analyze_file_metrics(SYNTHETIC_FILES)
        hotspots = sorted(result["hotspots"], key=lambda h: h["score"], reverse=True)
        rendered = []
        for i, h in enumerate(hotspots, 1):
            rendered.append({
                "id": f"hotspot-{i}",
                "path": h["file_path"],
                "module": h["file_path"].split("/")[0] if "/" in h["file_path"] else "",
                "language": self._language(h["file_path"]),
                "ext": h["file_path"].rsplit(".", 1)[-1],
                "loc": next((f["loc"] for f in SYNTHETIC_FILES if f["path"] == h["file_path"]), 0),
                "complexity": int(round(h["signals"]["complexity"])),
                "revisions": next((f["revisions"] for f in SYNTHETIC_FILES if f["path"] == h["file_path"]), 0),
                "linesAdded": int(round(next((f["churn"] / 2 for f in SYNTHETIC_FILES if f["path"] == h["file_path"]), 0))),
                "linesDeleted": int(round(next((f["churn"] / 2 for f in SYNTHETIC_FILES if f["path"] == h["file_path"]), 0))),
                "bugFixes": next((f["bug_fixes"] for f in SYNTHETIC_FILES if f["path"] == h["file_path"]), 0),
                "reverts": next((f["reverts"] for f in SYNTHETIC_FILES if f["path"] == h["file_path"]), 0),
                "churnLevel": self._level(h["signals"]["churn"]),
                "testSignal": self._level(100 - h["signals"]["test_gap"]),
                "lastTouched": "2026-09-01T00:00:00Z",
                "risk": int(round(h["score"])),
                "riskSeverity": h["risk_severity"],
                "signals": h["signals"],
                "weights": h["weights"],
            })
        return rendered

    def _level(self, score: float) -> str:
        if score >= 70:
            return "high"
        elif score >= 30:
            return "moderate"
        return "low"

    def _language(self, path: str) -> str:
        if path.endswith(".py"):
            return "Python"
        if path.endswith((".ts", ".tsx")):
            return "TypeScript"
        if path.endswith((".js", ".jsx")):
            return "JavaScript"
        return "Other"