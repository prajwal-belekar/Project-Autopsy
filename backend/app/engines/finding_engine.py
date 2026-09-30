from typing import Dict, Any, List, Optional

from app.engines.correlation_engine import CorrelationEngine


class FindingEngine:
    """
    Evidence-backed finding engine.

    Every finding carries:
      severity        -> derived from evidence strength
      confidence      -> analytical confidence (0-1), NOT human intent
      evidence        -> list of measurable repository observations
      impact          -> maintenance/risk impact stated from evidence
      recommendation  -> mapped directly to the evidence

    Duplicate findings describing the same underlying issue are merged.
    """

    SIGNAL_SUMMARIES = {
        "high_complexity": "high structural complexity",
        "high_churn_and_revisions": "elevated churn and revision frequency",
        "rework_pattern": "repeated bug-fix and revert activity",
        "change_and_bug_activity": "frequent changes with repeated bug fixes",
        "untested_active_area": "active area with limited test activity",
    }

    RECOMMENDATIONS = {
        "high_complexity": "Review module boundaries and split high-complexity functions.",
        "high_churn_and_revisions": "Investigate why this file changes so frequently and stabilise its contract.",
        "rework_pattern": "Add targeted regression tests for the repeatedly reworked behaviour.",
        "change_and_bug_activity": "Add focused unit/integration tests and review change verification flow.",
        "untested_active_area": "Add targeted integration tests for the most actively changing paths.",
    }

    def __init__(self):
        self.correlation_engine = CorrelationEngine()

    def generate_file_finding(self, file_path: str, normalized: Dict[str, float],
                              signal_snapshot: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        """
        Generate a single correlated finding for a file from its normalized signals.
        Returns None if no signal combination reaches the evidence threshold.
        """
        correlations = self.correlation_engine.correlate_file(file_path, normalized)
        if not correlations:
            return None

        correlation = correlations[0]
        patterns = correlation["patterns"]
        confidence = correlation["confidence"]
        signals = correlation["signals"]

        # Significance floor: at least one pattern backed by a strong signal.
        if confidence < 0.5:
            return None

        severity = self.severity_from_signals(signals, confidence)

        evidence = []
        for item in correlation["evidence"]:
            value = item["value"]
            if item["signal"] == "test_gap":
                evidence.append(f"testing gap signal: {value:.0f}/100")
            else:
                evidence.append(f"{item['signal']}: {value:.0f}/100")

        observed_facts = [
            self.SIGNAL_SUMMARIES.get(p, p.replace("_", " ")) for p in patterns
        ]

        title = " and ".join(observed_facts).capitalize()
        summary = f"{file_path} shows {', '.join(observed_facts)}."
        impact = "Repeated change combined with structural or verification gaps may raise maintenance risk."
        recommendation = self._merge_recommendations(patterns)

        return {
            "id": self._stable_id(file_path),
            "title": title,
            "severity": severity,
            "confidence": confidence,
            "summary": summary,
            "evidence": evidence,
            "impact": impact,
            "recommendation": recommendation,
            "file_path": file_path,
            "category": "correlated_risk",
            "patterns": patterns,
        }

    def generate_technical_debt_finding(self, file_path: str, debt_count: int,
                                        churn_signals: Dict[str, float]) -> Optional[Dict[str, Any]]:
        """
        Debt markers in a file get contextual importance: a TODO inside a
        high-churn hotspot is more significant than one in a stable file.
        """
        if debt_count <= 0:
            return None

        churn = churn_signals.get("churn", 0)
        revisions = churn_signals.get("revisions", 0)
        active = churn >= 50 or revisions >= 50

        severity = "medium" if active else "low"
        confidence = round(0.5 + 0.05 * debt_count + (0.1 if active else 0), 2)
        confidence = min(confidence, 0.85)

        return {
            "id": f"DEBT-{self._stable_id(file_path)}",
            "title": f"Technical debt markers in {file_path}",
            "severity": severity,
            "confidence": confidence,
            "summary": (
                f"{debt_count} debt marker(s) found in {file_path}. "
                + ("Located in a high-change file, increasing its relevance." if active
                   else "File is relatively stable.")
            ),
            "evidence": [
                f"{debt_count} TODO/FIXME/HACK markers",
                f"churn signal: {churn:.0f}/100",
                f"revision signal: {revisions:.0f}/100",
            ],
            "impact": "Unresolved markers in active files are more likely to be tripped over.",
            "recommendation": "Resolve debt markers in active files and add tests covering the marked behaviour.",
            "file_path": file_path,
            "category": "technical_debt",
            "patterns": ["debt_in_active_area"] if active else ["debt_in_stable_area"],
        }

    def deduplicate(self, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove findings that point at the same underlying issue (same file
        and overlapping pattern set), keeping the strongest one.
        """
        seen: Dict[str, Dict[str, Any]] = {}
        for finding in findings:
            key_parts = {p for p in finding.get("patterns", [])}
            key = finding.get("file_path", "") + "|" + self._canonical_pattern_key(key_parts, len(key_parts))
            existing = seen.get(key)
            if existing is None or finding["confidence"] > existing["confidence"]:
                seen[key] = finding
        return sorted(seen.values(), key=lambda f: f["confidence"], reverse=True)

    def severity_from_signals(self, signals: Dict[str, float], confidence: float) -> str:
        active_pattern_count = sum(
            1 for value in signals.values() if float(value) >= 60
        )
        if active_pattern_count >= 4 or confidence >= 0.85:
            return "critical"
        elif active_pattern_count >= 3 or confidence >= 0.7:
            return "high"
        elif active_pattern_count >= 2:
            return "medium"
        return "low"

    def _merge_recommendations(self, patterns: List[str]) -> str:
        seen = []
        for p in patterns:
            rec = self.RECOMMENDATIONS.get(p)
            if rec and rec not in seen:
                seen.append(rec)
        if not seen:
            return "Review the correlated signals and stabilise the module."
        return " ".join(seen)

    def _stable_id(self, file_path: str) -> str:
        return "F-" + str(abs(hash(file_path)) % 1000).zfill(3)

    def _canonical_pattern_key(self, patterns: set, count: int) -> str:
        return " ".join(sorted(patterns))