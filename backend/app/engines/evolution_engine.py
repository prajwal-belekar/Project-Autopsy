from typing import Dict, Any, List


class EvolutionEngine:
    """
    Time-aware comparison engine.

    Compares an earlier period with the current period and reports change in
    complexity, churn, bug-fix rate, revert rate, testing rate and friction.
    Findings describe observed change only; never the reason behind it.
    """

    METRICS = ["complexity", "churn", "bug_fixes", "reverts", "testing", "friction"]

    def compare_periods(self, historical: Dict[str, float], current: Dict[str, float]) -> Dict[str, Any]:
        deltas: Dict[str, float] = {}
        trend = {}

        for metric in self.METRICS:
            h = float(historical.get(metric, 0))
            c = float(current.get(metric, 0))
            delta = c - h
            deltas[metric] = round(delta, 2)
            trend[metric] = "increased" if delta > 0.5 else ("decreased" if delta < -0.5 else "stable")

        increasing = [m for m in self.METRICS if trend[m] == "increased"]
        decreasing = [m for m in self.METRICS if trend[m] == "decreased"]

        # Normalize delta magnitude against the historical baseline.
        magnitude = 0.0
        for metric, delta in deltas.items():
            base = abs(float(historical.get(metric, 0))) or 1.0
            magnitude = max(magnitude, abs(delta) / base)

        summary = "No significant change observed."
        if increasing:
            summary = f"Increased: {', '.join(increasing)}."

        return {
            "deltas": deltas,
            "trend": trend,
            "summary": summary,
            "change_magnitude": round(magnitude, 2),
            "attention_required": bool(increasing),
            "evidence": [
                {"metric": m, "historical": historical.get(m, 0), "current": current.get(m, 0)}
                for m in self.METRICS
            ],
        }

    def build_repository_period_metrics(self, monthly: List[Dict[str, Any]], split_index: int) -> Dict[str, Any]:
        """
        monthly: chronological list of {commits, churn, bug_fixes, reverts, testing, complexity}
        split_index: index separating historical (before) from current (from).
        Returns averaged per-period metrics for comparison.
        """
        historical = monthly[:split_index]
        current = monthly[split_index:]
        if not current:
            current = monthly[-1:]

        def _avg(rows, key):
            if not rows:
                return 0.0
            return sum(float(r.get(key, 0)) for r in rows) / len(rows)

        def _sum(rows, key):
            return sum(float(r.get(key, 0)) for r in rows)

        h = {
            "complexity": _avg(historical, "complexity"),
            "churn": _avg(historical, "churn"),
            "bug_fixes": _sum(historical, "bug_fixes"),
            "reverts": _avg(historical, "reverts"),
            "testing": _sum(historical, "testing"),
            "friction": _avg(historical, "friction"),
            "commits": _sum(historical, "commits"),
        }
        c = {
            "complexity": _avg(current, "complexity"),
            "churn": _avg(current, "churn"),
            "bug_fixes": _sum(current, "bug_fixes"),
            "reverts": _avg(current, "reverts"),
            "testing": _sum(current, "testing"),
            "friction": _avg(current, "friction"),
            "commits": _sum(current, "commits"),
        }
        comparison = self.compare_periods(h, c)
        comparison["total_commits"] = {"historical": int(h["commits"]), "current": int(c["commits"])}
        return comparison