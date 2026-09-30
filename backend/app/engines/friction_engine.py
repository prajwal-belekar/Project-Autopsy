from typing import Dict, Any


class FrictionEngine:
    """
    Deterministic Development Friction Index (0-100).

    Separates signals into three groups so the score is explainable:
      - Structural signals: complexity, coupling, file size, nesting
      - Historical signals: churn, revisions, bug fixes, reverts
      - Quality signals: testing gap, documentation, technical debt

    The total mathematically equals the sum of each component's
    contribution (score * weight), and each component is normalized
    repository-relative so small and large repositories are comparable.
    """

    DEFAULT_WEIGHTS = {
        # Structural
        "complexity": 0.12,
        "coupling": 0.04,
        "file_size": 0.03,
        "nesting": 0.03,
        # Historical
        "churn": 0.20,
        "revisions": 0.18,
        "bug_fixes": 0.15,
        "reverts": 0.10,
        # Quality
        "test_gap": 0.09,
        "documentation_gap": 0.04,
        "debt": 0.02,
    }

    CATEGORIES = {
        "structural": ["complexity", "coupling", "file_size", "nesting"],
        "historical": ["churn", "revisions", "bug_fixes", "reverts"],
        "quality": ["test_gap", "documentation_gap", "debt"],
    }

    @staticmethod
    def normalize(value: float, max_value: float) -> float:
        if max_value <= 0:
            return 0.0
        return min(float(value) / float(max_value), 1.0) * 100

    def calculate_friction(self, signals: Dict[str, Any], max_values: Dict[str, float]) -> Dict[str, Any]:
        """
        signals: raw values keyed by signal name.
        max_values: repository-relative reference maximums keyed by signal name.

        Returns a transparent breakdown where sum(contributions) == score.
        """
        factor_scores: Dict[str, float] = {}
        contributions: Dict[str, float] = {}

        for key, weight in self.DEFAULT_WEIGHTS.items():
            raw = signals.get(key, 0)
            max_val = max_values.get(key, 1)
            normalized = round(self.normalize(raw, max_val), 2)
            factor_scores[key] = normalized
            contributions[key] = round(normalized * weight, 2)

        score = round(sum(contributions.values()), 2)

        category_contributions = {}
        for category, keys in self.CATEGORIES.items():
            category_contributions[category] = round(
                sum(contributions.get(k, 0) for k in keys), 2
            )

        return {
            "score": score,
            "level": self._get_level(score),
            "tone": self._get_tone(score),
            "factor_scores": factor_scores,
            "contributions": contributions,
            "category_contributions": category_contributions,
            "weights": {k: v for k, v in self.DEFAULT_WEIGHTS.items()},
            "methodology": (
                "Repository-relative normalization of structural, historical and quality "
                "signals. Each factor score = raw / repository_max * 100, then multiplied "
                "by its documented weight. The sum of weighted contributions is the index."
            ),
        }

    @staticmethod
    def sum_contributions(contributions: Dict[str, float]) -> float:
        return round(sum(contributions.values()), 2)

    def _get_level(self, score: float) -> str:
        if score >= 70:
            return "high"
        elif score >= 40:
            return "moderate"
        return "low"

    def _get_tone(self, score: float) -> str:
        if score >= 70:
            return "crit"
        elif score >= 40:
            return "warn"
        return "ok"