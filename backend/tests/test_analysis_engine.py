import pytest
from app.core.normalization import NormalizationEngine
from app.engines.hotspot_engine import HotspotEngine
from app.engines.friction_engine import FrictionEngine
from app.engines.correlation_engine import CorrelationEngine
from app.engines.finding_engine import FindingEngine
from app.engines.rework_engine import ReworkDetectionEngine
from app.engines.testing_gap_engine import TestingGapEngine
from app.engines.evolution_engine import EvolutionEngine


# ---------------------------------------------------------------------------
# Normalization
# ---------------------------------------------------------------------------

class TestNormalization:
    def test_repository_relative(self):
        assert NormalizationEngine.repository_relative_normalize(50, 100) == 0.5
        assert NormalizationEngine.repository_relative_normalize(50, 0) == 0.0

    def test_complexity_diminishing_returns(self):
        assert NormalizationEngine.normalize_complexity(5, 10) > 0
        assert NormalizationEngine.normalize_complexity(10, 10) > NormalizationEngine.normalize_complexity(5, 10)

    def test_normalize_is_bounded(self):
        assert 0 <= NormalizationEngine.normalize_churn(99999, 100) <= 100
        assert 0 <= NormalizationEngine.calculate_test_gap(0, 100) <= 100


# ---------------------------------------------------------------------------
# Hotspot engine
# ---------------------------------------------------------------------------

class TestHotspot:
    def setup_method(self):
        self.engine = HotspotEngine()
        self.max_values = {
            "complexity": 30, "churn": 1500, "revisions": 25,
            "bug_fixes": 10, "reverts": 5, "test_signal": 50,
        }

    def test_score_in_bounds(self):
        file_data = {
            "complexity": 25, "churn": 1200, "revisions": 20,
            "bug_fixes": 8, "reverts": 2, "test_signal": 15,
            "modifications": 20,
        }
        result = self.engine.calculate_hotspot_score(file_data, self.max_values)
        assert 0 <= result["score"] <= 100
        assert "signals" in result
        assert result["risk_severity"] in ["critical", "high", "medium", "low", "informational"]

    def test_large_stable_file_is_not_hotspot(self):
        # Many lines but no churn/revisions => low score
        file_data = {
            "complexity": 90, "churn": 0, "revisions": 0,
            "bug_fixes": 0, "reverts": 0, "test_signal": 0,
            "modifications": 0,
        }
        result = self.engine.calculate_hotspot_score(file_data, self.max_values)
        # test_gap is suppressed for stable files; complexity alone is limited
        assert result["signals"]["test_gap"] == 0.0
        assert result["score"] < 30

    def test_hot_and_changing_file_scores_high(self):
        file_data = {
            "complexity": 30, "churn": 1500, "revisions": 25,
            "bug_fixes": 10, "reverts": 5, "test_signal": 0,
            "modifications": 25,
        }
        result = self.engine.calculate_hotspot_score(file_data, self.max_values)
        assert result["score"] > 60


# ---------------------------------------------------------------------------
# Friction engine
# ---------------------------------------------------------------------------

class TestFriction:
    def setup_method(self):
        self.engine = FrictionEngine()

    def test_friction_breakdown_is_consistent(self):
        signals = {
            "complexity": 25, "coupling": 10, "file_size": 800, "nesting": 4,
            "churn": 1200, "revisions": 15, "bug_fixes": 8, "reverts": 2,
            "test_gap": 85, "documentation_gap": 20, "debt": 3,
        }
        max_values = {
            "complexity": 30, "coupling": 20, "file_size": 1500, "nesting": 8,
            "churn": 1500, "revisions": 20, "bug_fixes": 10, "reverts": 5,
            "test_gap": 100, "documentation_gap": 100, "debt": 10,
        }
        result = self.engine.calculate_friction(signals, max_values)
        contribution_sum = self.engine.sum_contributions(result["contributions"])
        assert result["score"] == contribution_sum
        assert 0 <= result["score"] <= 100
        assert result["level"] in ["high", "moderate", "low"]
        assert result["tone"] in ["ok", "warn", "crit"]
        # Category contributions must also sum (approx, rounding)
        cat_sum = round(sum(result["category_contributions"].values()), 2)
        assert abs(cat_sum - result["score"]) < 0.06


# ---------------------------------------------------------------------------
# Correlation engine
# ---------------------------------------------------------------------------

class TestCorrelation:
    def setup_method(self):
        self.engine = CorrelationEngine()

    def test_high_signals_produce_correlation(self):
        normalized = {
            "complexity": 80, "churn": 85, "revisions": 80,
            "bug_fixes": 70, "reverts": 50, "test_gap": 80, "debt": 30,
        }
        results = self.engine.correlate_file("src/auth.ts", normalized)
        assert len(results) == 1
        assert results[0]["type"] == "multi_signal_risk"
        assert "high_complexity" in results[0]["patterns"]
        assert "untested_active_area" in results[0]["patterns"]

    def test_low_signals_produce_no_correlation(self):
        normalized = {
            "complexity": 10, "churn": 5, "revisions": 5,
            "bug_fixes": 0, "reverts": 0, "test_gap": 10, "debt": 0,
        }
        assert self.engine.correlate_file("src/ok.ts", normalized) == []

    def test_repository_primary_area(self):
        a = self.engine.correlate_file("a.ts", {
            "complexity": 90, "churn": 90, "revisions": 90,
            "bug_fixes": 80, "reverts": 60, "test_gap": 90, "debt": 20,
        })
        b = self.engine.correlate_file("b.ts", {
            "complexity": 40, "churn": 30, "revisions": 30,
            "bug_fixes": 10, "reverts": 0, "test_gap": 30, "debt": 0,
        })
        repo = self.engine.correlate_repository(a + b)
        assert repo["primary_area"]["file_path"] == "a.ts"
        assert repo["summary"]


# ---------------------------------------------------------------------------
# Finding engine
# ---------------------------------------------------------------------------

class TestFinding:
    def setup_method(self):
        self.engine = FindingEngine()

    def test_finding_requires_evidence(self):
        low = {
            "complexity": 10, "churn": 5, "revisions": 5,
            "bug_fixes": 0, "reverts": 0, "test_gap": 10, "debt": 0,
        }
        assert self.engine.generate_file_finding("src/ok.ts", low) is None

    def test_finding_has_all_required_fields(self):
        normalized = {
            "complexity": 85, "churn": 90, "revisions": 88,
            "bug_fixes": 75, "reverts": 50, "test_gap": 85, "debt": 20,
        }
        finding = self.engine.generate_file_finding("src/auth.ts", normalized)
        assert finding is not None
        for key in ["id", "title", "severity", "confidence", "summary",
                    "evidence", "impact", "recommendation"]:
            assert key in finding
        assert finding["confidence"] >= 0.5
        assert finding["severity"] in ["critical", "high", "medium", "low"]
        assert len(finding["evidence"]) > 0

    def test_severity_derived_from_evidence(self):
        mild = {
            "complexity": 65, "churn": 60, "revisions": 60,
            "bug_fixes": 30, "reverts": 0, "test_gap": 60, "debt": 0,
        }
        severe = {
            "complexity": 95, "churn": 95, "revisions": 95,
            "bug_fixes": 90, "reverts": 70, "test_gap": 95, "debt": 40,
        }
        mild_f = self.engine.generate_file_finding("m.ts", mild)
        severe_f = self.engine.generate_file_finding("s.ts", severe)
        assert mild_f is not None and severe_f is not None
        order = {"low": 0, "medium": 1, "high": 2, "critical": 3}
        assert order[severe_f["severity"]] >= order[mild_f["severity"]]

    def test_duplicate_findings_deduped(self):
        base = {
            "complexity": 85, "churn": 90, "revisions": 88,
            "bug_fixes": 75, "reverts": 50, "test_gap": 85, "debt": 20,
        }
        f1 = self.engine.generate_file_finding("src/auth.ts", base)
        f2 = dict(f1)
        f2["confidence"] = 0.5
        f3 = dict(f1)
        f3["confidence"] = 0.3
        deduped = self.engine.deduplicate([f3, f2, f1])
        assert len(deduped) == 1
        assert deduped[0]["confidence"] == f1["confidence"]

    def test_duplicate_findings_across_different_files_kept(self):
        base = {
            "complexity": 85, "churn": 90, "revisions": 88,
            "bug_fixes": 75, "reverts": 50, "test_gap": 85, "debt": 20,
        }
        f1 = self.engine.generate_file_finding("a.ts", base)
        f2 = self.engine.generate_file_finding("b.ts", base)
        deduped = self.engine.deduplicate([f1, f2])
        assert len(deduped) == 2

    def test_debt_finding_context(self):
        churn_signals = {"churn": 90, "revisions": 85}
        active = self.engine.generate_technical_debt_finding("active.ts", 2, churn_signals)
        stable = self.engine.generate_technical_debt_finding("stable.ts", 2, {
            "churn": 5, "revisions": 5,
        })
        assert active["severity"] == "medium"
        assert stable["severity"] == "low"
        assert active["confidence"] > stable["confidence"]

    def test_recommendation_maps_to_evidence(self):
        base = {
            "complexity": 85, "churn": 90, "revisions": 88,
            "bug_fixes": 75, "reverts": 50, "test_gap": 85, "debt": 20,
        }
        finding = self.engine.generate_file_finding("src/payment.ts", base)
        assert finding["recommendation"]
        assert "test" in finding["recommendation"].lower() or "stabil" in finding["recommendation"].lower()


# ---------------------------------------------------------------------------
# Rework detection
# ---------------------------------------------------------------------------

class TestRework:
    def setup_method(self):
        self.engine = ReworkDetectionEngine()

    def test_rework_signal_detected(self):
        activity = {"revisions": 25, "churn": 2000, "bug_fixes": 8, "reverts": 3}
        result = self.engine.detect(activity)
        assert result["rework_score"] > 0
        assert len(result["signals"]) == 3

    def test_stable_file_no_rework(self):
        activity = {"revisions": 1, "churn": 10, "bug_fixes": 0, "reverts": 0}
        result = self.engine.detect(activity)
        assert result["rework_score"] == 0

    def test_change_revert_change(self):
        sequence = [
            {"file": "a.ts", "hash": "c1", "revert": False},
            {"file": "a.ts", "hash": "r2", "revert": True},
            {"file": "a.ts", "hash": "c3", "revert": False},
        ]
        result = self.engine.detect_change_revert_change(sequence)
        assert len(result) == 1
        assert result[0]["file"] == "a.ts"


# ---------------------------------------------------------------------------
# Testing gap
# ---------------------------------------------------------------------------

class TestTestingGap:
    def setup_method(self):
        self.engine = TestingGapEngine()

    def test_high_gap_detected(self):
        gap = self.engine.compute_gap(
            {"source_changes": 40, "test_changes": 2},
            {"source_changes": 50, "test_changes": 30},
        )
        assert gap["testing_gap"] > 60
        assert gap["gap_level"] in ["high", "moderate"]

    def test_aligned_activity_low_gap(self):
        gap = self.engine.compute_gap(
            {"source_changes": 20, "test_changes": 18},
            {"source_changes": 50, "test_changes": 30},
        )
        assert gap["testing_gap"] < 30
        assert gap["gap_level"] == "low"

    def test_no_changes_no_gap(self):
        gap = self.engine.compute_gap(
            {"source_changes": 0, "test_changes": 0},
            {"source_changes": 50, "test_changes": 30},
        )
        assert gap["testing_gap"] == 0


# ---------------------------------------------------------------------------
# Evolution / time-aware
# ---------------------------------------------------------------------------

class TestEvolution:
    def setup_method(self):
        self.engine = EvolutionEngine()

    def test_comparison_detects_increase(self):
        hist = {"complexity": 30, "churn": 40, "bug_fixes": 2, "reverts": 0, "testing": 5, "friction": 30}
        curr = {"complexity": 55, "churn": 80, "bug_fixes": 6, "reverts": 2, "testing": 5, "friction": 60}
        result = self.engine.compare_periods(hist, curr)
        assert result["deltas"]["complexity"] > 0
        assert result["trend"]["churn"] == "increased"
        assert result["attention_required"] is True

    def test_comparison_stable(self):
        hist = {"complexity": 30, "churn": 40, "bug_fixes": 2, "reverts": 0, "testing": 5, "friction": 30}
        result = self.engine.compare_periods(hist, dict(hist))
        assert result["attention_required"] is False

    def test_monthly_split(self):
        monthly = [
            {"commits": 10, "churn": 100, "bug_fixes": 1, "reverts": 0, "testing": 1, "complexity": 30, "friction": 30},
            {"commits": 10, "churn": 100, "bug_fixes": 1, "reverts": 0, "testing": 1, "complexity": 30, "friction": 30},
            {"commits": 20, "churn": 500, "bug_fixes": 5, "reverts": 2, "testing": 0, "complexity": 55, "friction": 60},
        ]
        result = self.engine.build_repository_period_metrics(monthly, split_index=2)
        assert result["total_commits"]["historical"] == 20
        assert result["total_commits"]["current"] == 20
        assert result["deltas"]["complexity"] > 0