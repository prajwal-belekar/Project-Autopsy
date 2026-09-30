from typing import Dict, Any, List


class ReworkDetectionEngine:
    """
    Detects rework activity from git-derived evidence.

    Rework is a repository activity signal, never an attribution of intent.
    Patterns recognised:
      - repeated modification of the same file across time
      - change -> revert -> change again sequences
      - high churn + high revisions + repeated bug fixes
    """

    def detect(self, file_activity: Dict[str, Any]) -> Dict[str, Any]:
        """
        file_activity expects raw values:
          revisions, churn, bug_fixes, reverts
        """
        revisions = float(file_activity.get("revisions", 0))
        churn = float(file_activity.get("churn", 0))
        bug_fixes = float(file_activity.get("bug_fixes", 0))
        reverts = float(file_activity.get("reverts", 0))

        repeatedly_modified = revisions >= 10 and churn >= 500
        repeated_bug_fixes = bug_fixes >= 5
        revert_activity = reverts >= 1

        rework_score = 0.0
        signals = []

        if repeatedly_modified:
            rework_score += 3
            signals.append({"signal": "repeated_modification",
                            "value": revisions,
                            "evidence": f"{int(revisions)} revisions"})
        if repeated_bug_fixes:
            rework_score += 2
            signals.append({"signal": "repeated_bug_fixes",
                            "value": bug_fixes,
                            "evidence": f"{int(bug_fixes)} bug-fix commits"})
        if revert_activity:
            rework_score += 1.5
            signals.append({"signal": "revert_activity",
                            "value": reverts,
                            "evidence": f"{int(reverts)} revert commit(s)"})

        normalized = min(rework_score / 6.5, 1.0) * 100

        return {
            "rework_score": round(normalized, 2),
            "rework_level": self._level(normalized),
            "signals": signals,
            "description": (
                "Repeated modification activity indicates elevated development "
                "friction. This is an activity signal, not a judgment."
            ),
        }

    def detect_change_revert_change(self, commit_sequence: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Scans a chronological commit list for change -> revert -> change
        sequences on the same file. Each commit: {file, revert(bool)}.
        """
        sequences = []
        i = 0
        while i < len(commit_sequence) - 2:
            first, revert, third = commit_sequence[i], commit_sequence[i + 1], commit_sequence[i + 2]
            if (first.get("file") == revert.get("file") == third.get("file")
                    and revert.get("revert")
                    and not first.get("revert")
                    and not third.get("revert")):
                sequences.append({
                    "file": first["file"],
                    "commit_before_revert": first.get("hash"),
                    "revert_commit": revert.get("hash"),
                    "commit_after_revert": third.get("hash"),
                })
                i += 3
            else:
                i += 1
        return sequences

    def _level(self, score: float) -> str:
        if score >= 60:
            return "high"
        elif score >= 30:
            return "moderate"
        return "low"