import pytest

from app.services.evidence_analysis_service import EvidenceAnalysisService
from tests.fixtures.synthetic_repo import SYNTHETIC_FILES, SYNTHETIC_MONTHLY


class TestEvidenceAnalysisService:
    def setup_method(self):
        self.service = EvidenceAnalysisService()

    def test_hotspot_identifies_active_complex_file_not_big_stable_file(self):
        result = self.service.analyze_file_metrics(SYNTHETIC_FILES)
        files = {h["file_path"]: h for h in result["hotspots"]}
        assert files["src/auth/auth.py"]["score"] > files["utils/big.py"]["score"]
        # The large-but-stable file must stay low
        assert files["utils/big.py"]["score"] < 30

    def test_findings_are_evidence_backed(self):
        result = self.service.analyze_file_metrics(SYNTHETIC_FILES)
        for finding in result["findings"]:
            assert finding["evidence"]
            assert finding["confidence"] >= 0.5
            assert finding["recommendation"]

    def test_primary_area_is_auth(self):
        result = self.service.analyze_file_metrics(SYNTHETIC_FILES)
        assert result["primary_area"]["file_path"] == "src/auth/auth.py"
        assert result["correlation_summary"]

    def test_findings_deduplicated(self):
        result = self.service.analyze_file_metrics(SYNTHETIC_FILES)
        fids = [f["id"] for f in result["findings"]]
        assert len(fids) == len(set(fids))

    def test_recommendations_map_to_findings(self):
        result = self.service.analyze_file_metrics(SYNTHETIC_FILES)
        finding_ids = {f["id"] for f in result["findings"]}
        for rec in result["recommendations"]:
            assert rec["findingId"] in finding_ids
            assert rec["evidence"]

    def test_friction_matches_contributions(self):
        friction = self.service.compute_friction(SYNTHETIC_FILES)
        total = round(sum(friction["contributions"].values()), 2)
        assert friction["score"] == total

    def test_evolution_attention(self):
        evolution = self.service.analyze_evolution(SYNTHETIC_MONTHLY, split_index=2)
        assert evolution["attention_required"] is True
        assert evolution["deltas"]["churn"] > 0

    def test_raw_evidence_traceable(self):
        result = self.service.analyze_file_metrics(SYNTHETIC_FILES)
        evidence = self.service.collect_evidence_from_analysis(result)
        assert evidence
        # Every evidence item is traceable to a file with a value
        for item in evidence:
            assert item["file_path"]
            assert item["value"] is not None