from typing import Dict, Any, List, Tuple
from collections import defaultdict


class NormalizationEngine:
    """
    Handles normalization of metrics across repositories and files.
    Repository-relative normalization prevents small repos from dominating.
    """

    @staticmethod
    def repository_relative_normalize(value: float, repository_total: float) -> float:
        """
        Normalize a metric using repository-relative scaling.
        Returns a value between 0 and 1.
        """
        if repository_total <= 0:
            return 0.0
        return min(value / repository_total, 1.0)

    @staticmethod
    def percentile_normalize(values: List[float]) -> Dict[str, float]:
        """
        Convert a list of values to percentiles (0-100 scale).
        """
        if not values:
            return {}
        
        sorted_values = sorted(values)
        n = len(values)
        percentile_map = {}
        
        for i, value in enumerate(values):
            # Calculate percentile rank
            rank = i / (n - 1) if n > 1 else 0.5
            percentile_map[str(value)] = round(rank * 100, 2)
        
        return percentile_map

    @staticmethod
    def normalize_complexity(value: int, max_complexity: int) -> float:
        """
        Normalize complexity score (0-100 scale).
        Complexity has a threshold effect - going from 5 to 10 is more significant than from 20 to 25.
        """
        if max_complexity <= 5:
            return round(value, 2)
        
        # Use a logistic-like scaling that has diminishing returns at high values
        normalized = 100 * (1 - 2.718**(-value / max_complexity))
        return round(normalized, 2)

    @staticmethod
    def normalize_churn(value: float, max_churn: float) -> float:
        """
        Normalize churn score with repository-relative context.
        """
        if max_churn <= 0:
            return 0.0
        
        # Heavy churn threshold - files with churn > 100% of max get full score
        heavy_churn_threshold = max_churn * 1.5
        normalized = min(value / heavy_churn_threshold, 1.0) * 100
        return round(normalized, 2)

    @staticmethod
    def normalize_revisions(value: int, max_revisions: int) -> float:
        """
        Normalize revision count with moderate sensitivity to high values.
        """
        if max_revisions <= 0:
            return 0.0
        
        # Exponential scaling for revision frequency
        normalized = 100 * (1 - 2.718**(-value / max_revisions))
        return round(normalized, 2)

    @staticmethod
    def normalize_test_activity(value: float, max_activity: float) -> float:
        """
        Normalize test activity (higher is better).
        """
        if max_activity <= 0:
            return 0.0
        
        return min(value / max_activity, 1.0) * 100

    @staticmethod
    def calculate_test_gap(test_activity: float, max_activity: float) -> float:
        """
        Calculate test gap (inverse of test activity, 0-100 scale).
        """
        normalized_activity = NormalizationEngine.normalize_test_activity(test_activity, max_activity)
        return 100 - normalized_activity

    @staticmethod
    def compute_normalized_metrics(
        metrics: List[Dict[str, Any]],
        metric_keys: List[str]
    ) -> Tuple[Dict[str, Dict[str, float]], Dict[str, float]]:
        """
        Compute normalized versions of metrics across a collection of items.
        Returns normalized metrics and max values for reference.
        """
        max_values = {}
        normalized_metrics = {}
        
        for key in metric_keys:
            values = [item.get(key, 0) for item in metrics]
            max_values[key] = max(values) if values else 1
            
            normalized = []
            for item in metrics:
                normalized_value = NormalizationEngine._get_normalizer(key)(item.get(key, 0), max_values[key])
                normalized.append(normalized_value)
            
            normalized_metrics[key] = normalized
        
        return normalized_metrics, max_values

    @staticmethod
    def _get_normalizer(key: str):
        """Get the appropriate normalizer for a metric key."""
        normalizers = {
            "complexity": NormalizationEngine.normalize_complexity,
            "churn": NormalizationEngine.normalize_churn,
            "revisions": NormalizationEngine.normalize_revisions,
            "test_activity": NormalizationEngine.normalize_test_activity,
        }
        return normalizers.get(key, NormalizationEngine.repository_relative_normalize)

    @staticmethod
    def extract_repository_benchmarks(metrics: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Extract benchmark values from repository metrics for normalization.
        These are used as reference points for different repositories.
        """
        if not metrics:
            return {}
        
        benchmarks = {}
        for key in ["complexity", "churn", "revisions", "test_activity"]:
            values = [m.get(key, 0) for m in metrics]
            benchmarks[f"{key}_p25"] = sorted(values)[len(values) // 4] if len(values) >= 4 else values[0]
            benchmarks[f"{key}_p50"] = sorted(values)[len(values) // 2] if len(values) >= 2 else values[0]
            benchmarks[f"{key}_p75"] = sorted(values)[3 * len(values) // 4] if len(values) >= 4 else values[-1]
            benchmarks[f"max_{key}"] = max(values) if values else 1
        
        return benchmarks