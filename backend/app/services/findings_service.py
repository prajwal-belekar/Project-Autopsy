from typing import Dict, Any, List, Optional
from app.services.evidence_analysis_service import EvidenceAnalysisService
from app.data.synthetic_repo import SYNTHETIC_FILES


class FindingsService:
    """Evidence-backed findings and mapped recommendations."""

    def __init__(self):
        self.evidence_service = EvidenceAnalysisService()

    async def get_findings(self, repository_id: str,
                           severity: Optional[str] = None,
                           category: Optional[str] = None,
                           file_path: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
        result = self.evidence_service.analyze_file_metrics(SYNTHETIC_FILES)
        findings = result["findings"]

        if severity:
            findings = [f for f in findings if f["severity"] == severity]
        if category:
            findings = [f for f in findings if f.get("category") == category]
        if file_path:
            findings = [f for f in findings if f["file_path"] == file_path]

        return [self._to_frontend_shape(f) for f in findings]

    async def get_recommendations(self, repository_id: str) -> Optional[List[Dict[str, Any]]]:
        result = self.evidence_service.analyze_file_metrics(SYNTHETIC_FILES)
        return result["recommendations"]

    async def get_primary_finding(self, repository_id: str) -> Optional[Dict[str, Any]]:
        result = self.evidence_service.analyze_file_metrics(SYNTHETIC_FILES)
        findings = result["findings"]
        if not findings:
            return None
        top = findings[0]
        return {
            "area": top["file_path"],
            "filePath": top["file_path"],
            "summary": top["summary"],
            "severity": top["severity"],
            "evidence": [
                {"label": "Confidence", "value": f"{top['confidence']:.2f}", "tone": "neutral"}
            ] + [{"label": e, "value": "", "tone": "neutral"} for e in top["evidence"]],
        }

    def _to_frontend_shape(self, finding: Dict[str, Any]) -> Dict[str, Any]:
        area = finding.get("file_path", "")
        return {
            "id": finding["id"],
            "title": finding["title"],
            "area": area,
            "severity": finding["severity"],
            "observation": finding["summary"],
            "evidence": finding["evidence"],
            "impact": finding["impact"],
            "recommendation": finding["recommendation"],
            "evidenceLink": {"label": "View file", "to": f"/repository/placeholder/files/{area}"},
            "confidence": finding["confidence"],
            "category": finding.get("category"),
            "patterns": finding.get("patterns", []),
        }