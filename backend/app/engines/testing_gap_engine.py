from typing import Dict, Any, List


class TestingGapEngine:
    """
    Correlates changed source files with test activity to produce a
    testing-gap signal. Merely counting test files is insufficient.

    signal = source_changes / max(source_changes_in_repo) * 100
    test_coverage_signal = test_changes_for_module / max(test_changes_in_repo) * 100
    testing_gap = max(0, source_signal - test_signal)
    """

    def compute_gap(self, module_changes: Dict[str, Any], repository_max: Dict[str, float]) -> Dict[str, Any]:
        """
        module_changes: { source_changes, test_changes }
        repository_max: { source_changes, test_changes } (max across repo)
        """
        source = float(module_changes.get("source_changes", 0))
        test = float(module_changes.get("test_changes", 0))

        max_source = float(repository_max.get("source_changes", 1)) or 1
        max_test = float(repository_max.get("test_changes", 1)) or 1

        source_signal = min(source / max_source, 1.0) * 100
        test_signal = min(test / max_test, 1.0) * 100

        gap = max(0.0, round(source_signal - test_signal, 2))

        return {
            "source_signal": round(source_signal, 2),
            "test_signal": round(test_signal, 2),
            "testing_gap": gap,
            "gap_level": self._level(gap),
            "evidence": [
                f"{int(source)} source-file changes",
                f"{int(test)} test-file changes",
            ],
        }

    def classify_module(self, gap_data: Dict[str, Any]) -> Dict[str, Any]:
        gap = gap_data["testing_gap"]
        if gap >= 70:
            level = "high"
            note = "Module changes frequently with comparatively little test activity."
        elif gap >= 40:
            level = "moderate"
            note = "Test activity lags behind source changes."
        else:
            level = "low"
            note = "Test activity is reasonably aligned with source changes."
        return {
            "level": level,
            "note": note,
            "evidence": gap_data["evidence"],
        }

    def _level(self, gap: float) -> str:
        if gap >= 70:
            return "high"
        elif gap >= 40:
            return "moderate"
        return "low"