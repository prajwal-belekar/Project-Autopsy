from typing import Dict, Any
from app.services.evidence_analysis_service import EvidenceAnalysisService
from app.data.synthetic_repo import SYNTHETIC_FILES


class FrictionService:
    """
    Development Friction Index endpoint backed by the evidence pipeline.
    Returns a transparent breakdown so the frontend can explain the score.
    """

    def __init__(self):
        self.evidence_service = EvidenceAnalysisService()

    async def get_friction(self, repository_id: str) -> Dict[str, Any]:
        friction = self.evidence_service.compute_friction(SYNTHETIC_FILES)

        factor_names = {
            "complexity": "Complexity",
            "coupling": "Coupling",
            "file_size": "File Size",
            "nesting": "Nesting Depth",
            "churn": "Code Churn",
            "revisions": "Revision Frequency",
            "bug_fixes": "Bug-Fix Activity",
            "reverts": "Revert Activity",
            "test_gap": "Testing Gap",
            "documentation_gap": "Documentation Gap",
            "debt": "Technical Debt",
        }

        factors = []
        for key, score in friction["factor_scores"].items():
            tone = "crit" if score >= 70 else ("warn" if score >= 40 else "ok")
            level = "high" if score >= 70 else ("moderate" if score >= 40 else "low")
            factors.append({
                "name": factor_names.get(key, key.replace("_", " ").title()),
                "level": level,
                "tone": tone,
                "score": int(round(score)),
                "weightPct": int(round(friction["weights"][key] * 100)),
                "description": f"{factor_names.get(key, key)} signal, normalized repository-relative.",
                "source": key,
            })

        weights = [
            {"factor": factor_names.get(k, k), "pct": int(round(w * 100))}
            for k, w in friction["weights"].items()
        ]

        return {
            "score": int(round(friction["score"])),
            "level": friction["level"],
            "description": self._describe(friction["score"], friction["category_contributions"]),
            "series": [],
            "factors": factors,
            "weights": weights,
            "note": friction["methodology"],
            "contributions": friction["contributions"],
            "category_contributions": friction["category_contributions"],
        }

    def _describe(self, score: float, categories: Dict[str, float]) -> str:
        top = max(categories, key=categories.get)
        label = {"historical": "historical change activity",
                 "structural": "structural complexity",
                 "quality": "quality signals (testing/docs)"}.get(top, top)
        return f"Development friction {int(round(score))}/100, driven primarily by {label}."