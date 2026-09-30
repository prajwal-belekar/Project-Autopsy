from typing import Dict, Any


class HotspotEngine:
    """
    Deterministic hotspot scoring engine.

    A file is only a hotspot when *multiple* signals agree. A large but
    stable file is deliberately NOT a hotspot: size is a proxy, not a signal.

    Signals (each normalized 0-100 then weighted):
      complexity, churn, revisions, bug_fix_activity, reverts, test_gap

    The test_gap signal is only applied when there is evidence of change
    activity; files that were never touched are not penalised for lacking tests.
    """

    DEFAULT_WEIGHTS = {
        "complexity": 0.25,
        "churn": 0.25,
        "revisions": 0.20,
        "bug_fix_activity": 0.15,
        "reverts": 0.10,
        "test_gap": 0.05,
    }

    ACTIVE_THRESHOLD = 5

    @staticmethod
    def normalize(value: float, max_value: float) -> float:
        if max_value <= 0:
            return 0.0
        return min(float(value) / float(max_value), 1.0) * 100

    def calculate_hotspot_score(self, file_data: Dict[str, Any], max_values: Dict[str, float]) -> Dict[str, Any]:
        """
        file_data expects keys: complexity, churn, revisions, bug_fixes,
        reverts, test_signal (0-100 where higher is better), modifications.
        Returns score plus per-signal breakdown for explainability.
        """
        revisions = float(file_data.get("revisions", 0))
        changes = float(file_data.get("modifications", revisions))

        complexity = self.normalize(file_data.get("complexity", 0), max_values.get("complexity", 1))
        churn = self.normalize(file_data.get("churn", 0), max_values.get("churn", 1))
        revision = self.normalize(revisions, max_values.get("revisions", 1))
        bug_fix = self.normalize(file_data.get("bug_fixes", 0), max_values.get("bug_fixes", 1))
        revert = self.normalize(file_data.get("reverts", 0), max_values.get("reverts", 1))

        # Testing gap only counts when the file actually changes; stable
        # untouched files are not flagged for a missing test suite.
        if changes >= self.ACTIVE_THRESHOLD:
            test_signal = self.normalize(file_data.get("test_signal", 0), max_values.get("test_signal", 1))
            test_gap = 100 - test_signal
        else:
            test_gap = 0.0

        signals = {
            "complexity": complexity,
            "churn": churn,
            "revisions": revision,
            "bug_fix_activity": bug_fix,
            "reverts": revert,
            "test_gap": test_gap,
        }

        score = round(
            sum(signals[k] * self.DEFAULT_WEIGHTS[k] for k in self.DEFAULT_WEIGHTS),
            2,
        )

        return {
            "score": score,
            "signals": signals,
            "weights": {k: v for k, v in self.DEFAULT_WEIGHTS.items()},
            "risk_severity": self.get_risk_severity(score),
            "churn_level": self._score_level(churn),
            "test_signal": self._score_level(100 - test_gap),
        }

    def get_risk_severity(self, score: float) -> str:
        if score >= 70:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 30:
            return "medium"
        elif score >= 10:
            return "low"
        return "informational"

    def _score_level(self, score: float) -> str:
        if score >= 70:
            return "high"
        elif score >= 30:
            return "moderate"
        return "low"