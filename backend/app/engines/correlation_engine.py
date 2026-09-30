from typing import Dict, Any, List


class CorrelationEngine:
    """
    Cross-signal correlation engine.

    Consumes normalized signals for a file/module and produces correlated
    risk patterns. Overlapping patterns are merged into a single stronger
    finding rather than emitting many duplicate low-value ones.
    """

    def correlate_file(self, file_path: str, normalized: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        normalized must contain 0-100 values for keys:
        complexity, churn, revisions, bug_fixes, reverts, test_gap, debt.
        """
        results: List[Dict[str, Any]] = []
        patterns = []

        complexity = normalized.get("complexity", 0)
        churn = normalized.get("churn", 0)
        revisions = normalized.get("revisions", 0)
        bug_fixes = normalized.get("bug_fixes", 0)
        reverts = normalized.get("reverts", 0)
        test_gap = normalized.get("test_gap", 0)
        debt = normalized.get("debt", 0)

        active_change = revisions >= 50 or churn >= 50

        high_complexity = complexity >= 60
        high_churn = churn >= 60
        high_revision = revisions >= 60
        high_bugs = bug_fixes >= 50
        high_reverts = reverts >= 40
        high_test_gap = test_gap >= 60 and active_change

        if high_complexity:
            patterns.append({"signal": "high_complexity", "weight": 1})

        if high_churn and high_revision:
            patterns.append({"signal": "high_churn_and_revisions", "weight": 1})

        if high_bugs and high_reverts:
            patterns.append({"signal": "rework_pattern", "weight": 1})

        if high_churn and high_bugs:
            patterns.append({"signal": "change_and_bug_activity", "weight": 1})

        if high_test_gap and (high_complexity or high_churn or high_revision):
            patterns.append({"signal": "untested_active_area", "weight": 1})

        if not patterns:
            return results

        # A single root correlation merges all present signals.
        results.append({
            "file_path": file_path,
            "type": "multi_signal_risk",
            "patterns": [p["signal"] for p in patterns],
            "signals": {
                "complexity": complexity,
                "churn": churn,
                "revisions": revisions,
                "bug_fixes": bug_fixes,
                "reverts": reverts,
                "test_gap": test_gap,
                "debt": debt,
            },
            "confidence": self._confidence(len(patterns)),
            "evidence": [
                {"signal": s, "value": round(normalized.get(s, 0), 2)}
                for s in ("complexity", "churn", "revisions", "bug_fixes", "reverts", "test_gap", "debt")
                if normalized.get(s, 0) > 0
            ],
        })
        return results

    def correlate_repository(self, file_correlations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate per-file correlations into repository-level signals:
        primary area requiring attention and overall correlation summary.
        """
        if not file_correlations:
            return {
                "primary_area": None,
                "summary": "No correlated risk signals detected.",
                "file_correlations": [],
            }

        strongest = max(file_correlations, key=lambda c: c.get("confidence", 0))
        high_risk_files = [c for c in file_correlations if c.get("confidence", 0) >= 0.6]

        return {
            "primary_area": {
                "file_path": strongest["file_path"],
                "patterns": strongest["patterns"],
                "confidence": strongest["confidence"],
            },
            "summary": (
                f"{len(high_risk_files)} file(s) show correlated risk. "
                f"Primary area: {strongest['file_path']}."
            ),
            "file_correlations": file_correlations,
        }

    def _confidence(self, pattern_count: int) -> float:
        return round(min(0.5 + 0.08 * pattern_count, 0.95), 2)