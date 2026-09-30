from typing import Dict, Any, List, Optional

from app.models.evidence import Evidence
from app.core.normalization import NormalizationEngine
from app.engines.hotspot_engine import HotspotEngine
from app.engines.friction_engine import FrictionEngine
from app.engines.correlation_engine import CorrelationEngine
from app.engines.finding_engine import FindingEngine
from app.engines.rework_engine import ReworkDetectionEngine
from app.engines.testing_gap_engine import TestingGapEngine
from app.engines.evolution_engine import EvolutionEngine


class EvidenceAnalysisService:
    """
    Coordinates the evidence pipeline:

      Raw evidence -> normalized (repository-relative) metrics
      -> cross-signal correlation -> risk signals
      -> evidence-backed findings -> recommendations.

    Never produces a finding without measurable evidence, and all scores
    are deterministic and explainable.
    """

    def __init__(self):
        self.hotspot_engine = HotspotEngine()
        self.friction_engine = FrictionEngine()
        self.correlation_engine = CorrelationEngine()
        self.finding_engine = FindingEngine()
        self.rework_engine = ReworkDetectionEngine()
        self.testing_gap_engine = TestingGapEngine()
        self.evolution_engine = EvolutionEngine()
        self.normalization = NormalizationEngine()

    def analyze_file_metrics(self, files: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        files: list of dicts with raw per-file signals:
          path, complexity, churn, revisions, bug_fixes, reverts,
          test_signal, modifications, loc, debt_count, nesting, coupling.
        Returns hotspots with per-signal breakdown, friction per file group,
        correlated findings (deduplicated) and the repository primary area.
        """
        if not files:
            return {
                "hotspots": [],
                "findings": [],
                "primary_area": None,
                "friction": None,
            }

        # Repository-relative maxima for normalization.
        max_values = {
            "complexity": max((f.get("complexity", 0) for f in files), default=1) or 1,
            "churn": max((f.get("churn", 0) for f in files), default=1) or 1,
            "revisions": max((f.get("revisions", 0) for f in files), default=1) or 1,
            "bug_fixes": max((f.get("bug_fixes", 0) for f in files), default=1) or 1,
            "reverts": max((f.get("reverts", 0) for f in files), default=1) or 1,
            "test_signal": 100,
        }

        hotspots: List[Dict[str, Any]] = []
        normalized_signals: List[Dict[str, float]] = []
        findings: List[Dict[str, Any]] = []

        for f in files:
            hotspot_result = self.hotspot_engine.calculate_hotspot_score(f, max_values)
            hotspots.append({
                "file_path": f["path"],
                "score": hotspot_result["score"],
                "risk_severity": hotspot_result["risk_severity"],
                "signals": hotspot_result["signals"],
                "weights": hotspot_result["weights"],
            })

            normalized = {
                "complexity": hotspot_result["signals"]["complexity"],
                "churn": hotspot_result["signals"]["churn"],
                "revisions": hotspot_result["signals"]["revisions"],
                "bug_fixes": hotspot_result["signals"]["bug_fix_activity"],
                "reverts": hotspot_result["signals"]["reverts"],
                "test_gap": hotspot_result["signals"]["test_gap"],
                "debt": self.normalization.repository_relative_normalize(
                    f.get("debt_count", 0),
                    max((x.get("debt_count", 0) for x in files), default=1) or 1
                ) * 100,
            }
            normalized_signals.append(normalized)

            finding = self.finding_engine.generate_file_finding(f["path"], normalized)
            if finding:
                findings.append(finding)

            debt_finding = self.finding_engine.generate_technical_debt_finding(
                f["path"], f.get("debt_count", 0), normalized
            )
            if debt_finding:
                findings.append(debt_finding)

        # Deduplicate findings by underlying issue.
        findings = self.finding_engine.deduplicate(findings)

        # Correlation across files -> primary area requiring attention.
        all_correlations: List[Dict[str, Any]] = []
        for f, normalized in zip(files, normalized_signals):
            all_correlations.extend(self.correlation_engine.correlate_file(f["path"], normalized))
        repo_correlation = self.correlation_engine.correlate_repository(all_correlations)

        # Recommended actions mapped from the strongest findings.
        recommendations = self._recommendations_from_findings(findings)

        return {
            "hotspots": hotspots,
            "findings": findings,
            "recommendations": recommendations,
            "primary_area": repo_correlation["primary_area"],
            "correlation_summary": repo_correlation["summary"],
        }

    def compute_friction(self, files: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Repository-wide friction from per-file raw signals.
        Signals are aggregated (max / mean) then normalized repository-relative.
        """
        if not files:
            return {"score": 0, "level": "low", "contributions": {}, "category_contributions": {}}

        aggregate_max = {
            "complexity": max((f.get("complexity", 0) for f in files), default=1) or 1,
            "coupling": max((f.get("coupling", 0) for f in files), default=1) or 1,
            "file_size": max((f.get("loc", 0) for f in files), default=1) or 1,
            "nesting": max((f.get("nesting", 0) for f in files), default=1) or 1,
            "churn": max((f.get("churn", 0) for f in files), default=1) or 1,
            "revisions": max((f.get("revisions", 0) for f in files), default=1) or 1,
            "bug_fixes": max((f.get("bug_fixes", 0) for f in files), default=1) or 1,
            "reverts": max((f.get("reverts", 0) for f in files), default=1) or 1,
            "test_gap": 100,
            "documentation_gap": 100,
            "debt": max((f.get("debt_count", 0) for f in files), default=1) or 1,
        }

        signals = {
            "complexity": max(f.get("complexity", 0) for f in files),
            "coupling": max(f.get("coupling", 0) for f in files),
            "file_size": max(f.get("loc", 0) for f in files),
            "nesting": max(f.get("nesting", 0) for f in files),
            "churn": max(f.get("churn", 0) for f in files),
            "revisions": max(f.get("revisions", 0) for f in files),
            "bug_fixes": max(f.get("bug_fixes", 0) for f in files),
            "reverts": max(f.get("reverts", 0) for f in files),
            "test_gap": self._max_test_gap(files),
            "documentation_gap": 100 - self._documentation_signal(files),
            "debt": max(f.get("debt_count", 0) for f in files),
        }

        return self.friction_engine.calculate_friction(signals, aggregate_max)

    def analyze_evolution(self, monthly_data: List[Dict[str, Any]], split_index: int) -> Dict[str, Any]:
        return self.evolution_engine.build_repository_period_metrics(monthly_data, split_index)

    def rework_analysis(self, file_activity: Dict[str, Any]) -> Dict[str, Any]:
        return self.rework_engine.detect(file_activity)

    def testing_gap_analysis(self, module_changes: Dict[str, Any],
                             repository_max: Dict[str, float]) -> Dict[str, Any]:
        gap = self.testing_gap_engine.compute_gap(module_changes, repository_max)
        classification = self.testing_gap_engine.classify_module(gap)
        return {**gap, **classification}

    def _recommendations_from_findings(self, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        recommendations = []
        for i, finding in enumerate(findings, 1):
            recommendations.append({
                "id": f"R-{i:03d}",
                "priority": self._priority_for_severity(finding["severity"]),
                "priorityLabel": self._priority_label(finding["severity"]),
                "issue": finding["title"],
                "evidence": finding["evidence"],
                "action": finding["recommendation"],
                "benefit": finding["impact"],
                "findingId": finding["id"],
            })
        return recommendations

    def _priority_for_severity(self, severity: str) -> str:
        return {"critical": "P0", "high": "P1", "medium": "P2", "low": "P2"}.get(severity, "P2")

    def _priority_label(self, severity: str) -> str:
        return {"critical": "Critical", "high": "High", "medium": "Normal", "low": "Normal"}.get(severity, "Normal")

    def _max_test_gap(self, files: List[Dict[str, Any]]) -> float:
        gaps = []
        for f in files:
            test_signal = f.get("test_signal", 0)
            changes = f.get("modifications", f.get("revisions", 0))
            if changes >= HotspotEngine.ACTIVE_THRESHOLD:
                gaps.append(100 - min(float(test_signal), 100))
        return max(gaps, default=0.0)

    def _documentation_signal(self, files: List[Dict[str, Any]]) -> float:
        documented = sum(1 for f in files if f.get("documented"))
        return (documented / len(files)) * 100 if files else 0.0

    @staticmethod
    def collect_evidence_from_analysis(analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Flatten an analysis result into a list of Evidence dicts for the
        raw-evidence log. All derived findings must trace back to these.
        """
        evidence_list: List[Dict[str, Any]] = []
        for hotspot in analysis.get("hotspots", []):
            for signal, value in hotspot.get("signals", {}).items():
                if float(value) > 0:
                    evidence_list.append(Evidence(
                        evidence_type=signal,
                        source="normalized_metrics",
                        file_path=hotspot["file_path"],
                        metric=signal,
                        value=value,
                        description=f"Normalized {signal} signal",
                    ).to_dict())
        return evidence_list