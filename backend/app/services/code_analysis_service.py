from typing import Dict, Any, List, Optional
from app.services.repository_service import RepositoryService
from app.services.evidence_analysis_service import EvidenceAnalysisService


class CodeAnalysisService:
    def __init__(self):
        self.repository_service = RepositoryService()
        self.evidence_service = EvidenceAnalysisService()

    async def get_code_health(self, repository_id: str) -> Dict[str, Any]:
        """Get code health metrics derived from actual repository source files."""
        repo_data = await self.repository_service.get_repository(repository_id)
        if not repo_data:
            return {
                "metrics": [],
                "complexityDistribution": [],
                "largestFiles": [],
                "largestFunctions": [],
                "coupling": [],
            }

        files = repo_data.get("files", [])
        if not files:
            return {
                "metrics": [],
                "complexityDistribution": [],
                "largestFiles": [],
                "largestFunctions": [],
                "coupling": [],
            }

        # Compute friction and get factor scores
        friction = self.evidence_service.compute_friction(files)
        factor_scores = friction.get("factor_scores", {}) if friction else {}

        # Build simple health metrics from factor scores
        metrics = [
            {
                "label": "Complexity",
                "score": factor_scores.get("complexity", 0),
                "severity": "medium" if factor_scores.get("complexity", 0) > 50 else "low",
                "hint": f"Complexity signal: {factor_scores.get('complexity', 0):.0f}/100",
            },
            {
                "label": "Churn",
                "score": factor_scores.get("churn", 0),
                "severity": "medium" if factor_scores.get("churn", 0) > 50 else "low",
                "hint": f"Churn signal: {factor_scores.get('churn', 0):.0f}/100",
            },
            {
                "label": "Test Coverage Gap",
                "score": factor_scores.get("test_gap", 0),
                "severity": "high" if factor_scores.get("test_gap", 0) > 70 else ("medium" if factor_scores.get("test_gap", 0) > 40 else "low"),
                "hint": f"Testing gap signal: {factor_scores.get('test_gap', 0):.0f}/100",
            },
        ]

        # Simplified distribution - count files in complexity bands
        complexity_distribution = []
        for band, label in [("0-10", "Very Low"), ("11-20", "Low"), ("21-30", "Medium"), ("31-50", "High"), ("51+", "Very High")]:
            count = sum(1 for f in files if f.get("complexity", 0) < {"0-10": 11, "11-20": 21, "21-30": 31, "31-50": 51, "51+": 9999}[band])
            complexity_distribution.append({"band": band, "files": count, "label": label})

        # Top 5 files by LOC
        largest_files = sorted(files, key=lambda f: f.get("loc", 0), reverse=True)[:5]
        largest_files_info = [
            {
                "path": f.get("path", ""),
                "loc": f.get("loc", 0),
                "complexity": f.get("complexity", 0),
            }
            for f in largest_files
        ]

        # Coupling summary - top modules by coupling count
        coupling_summary: Dict[str, int] = {}
        for f in files:
            module = f.get("path", "").split("/")[0] if "/" in f.get("path", "") else "root"
            coupling_summary[module] = coupling_summary.get(module, 0) + f.get("coupling", 0)
        coupling_list = sorted(coupling_summary.items(), key=lambda x: x[1], reverse=True)[:5]
        coupling_list_info = [
            {"module": mod, "coupling": count}
            for mod, count in coupling_list
        ]

        return {
            "metrics": metrics,
            "complexityDistribution": complexity_distribution,
            "largestFiles": largest_files_info,
            "coupling": coupling_list_info,
        }

    async def get_file_details(self, repository_id: str, file_path: str) -> Dict[str, Any]:
        """Get detailed information about a specific repository file."""
        repo_data = await self.repository_service.get_repository(repository_id)
        if not repo_data:
            return {
                "path": file_path,
                "module": "core",
                "language": "TypeScript",
                "loc": 100,
                "functions": 5,
                "classes": 1,
                "imports": 10,
                "complexity": 5,
                "revisions": 10,
                "linesAdded": 50,
                "linesDeleted": 20,
                "bugFixes": 1,
                "reverts": 0,
                "risk": 10,
                "riskSeverity": "low",
                "churnLevel": "low",
                "testSignal": "low",
                "debtCount": 0,
                "coupling": {"afferent": 1, "efferent": 1},
                "summary": "...",
                "structure": {"functions": [], "classes": [], "imports": []},
                "history": [],
                "findings": [],
                "debt": [],
            }

        files = repo_data.get("files", [])
        # Find the matching file (path is relative to repo root)
        matching = [f for f in files if f.get("path") == file_path or f.get("path").endswith("/" + file_path)]

        if not matching:
            # File not in our acquired set; return a minimal stub
            return {
                "path": file_path,
                "module": "core",
                "language": "TypeScript",
                "loc": 100,
                "functions": 5,
                "classes": 1,
                "imports": 10,
                "complexity": 5,
                "revisions": 0,
                "linesAdded": 0,
                "linesDeleted": 0,
                "bugFixes": 0,
                "reverts": 0,
                "risk": 0,
                "riskSeverity": "low",
                "churnLevel": "low",
                "testSignal": "low",
                "debtCount": 0,
                "coupling": {"afferent": 1, "efferent": 1},
                "summary": "File not found in acquired data.",
                "structure": {"functions": [], "classes": [], "imports": []},
                "history": [],
                "findings": [],
                "debt": [],
            }

        f = matching[0]

        return {
            "path": f.get("path", file_path),
            "module": f.get("path", "").split("/")[0] if "/" in f.get("path", "") else "root",
            "language": self._detect_language(f.get("path", "")),
            "loc": f.get("loc", 0),
            "functions": 0,
            "classes": 0,
            "imports": f.get("coupling", 0),
            "complexity": f.get("complexity", 0),
            "revisions": f.get("revisions", 0),
            "linesAdded": 0,
            "linesDeleted": 0,
            "bugFixes": f.get("bug_fixes", 0),
            "reverts": f.get("reverts", 0),
            "risk": f.get("score", 0) if f.get("score") else 0,
            "riskSeverity": self._risk_severity(f.get("score", 0)) if f.get("score") else "low",
            "churnLevel": self._churn_level(f.get("churn", 0)),
            "testSignal": f.get("test_signal", "low"),
            "debtCount": f.get("debt_count", 0),
            "coupling": {"afferent": 1, "efferent": f.get("coupling", 0)},
            "summary": f"File: {f.get('path', '')} — complexity {f.get('complexity', 0)}, churn {f.get('churn', 0)}, debt markers {f.get('debt_count', 0)}.",
            "structure": {"functions": [], "classes": [], "imports": []},
            "history": [],
            "findings": [],
            "debt": [],
        }

    @staticmethod
    def _detect_language(path: str) -> str:
        ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
        ext_map = {
            ".py": "Python",
            ".js": "JavaScript",
            ".jsx": "JavaScript",
            ".ts": "TypeScript",
            ".tsx": "TypeScript",
        }
        return ext_map.get(ext, "Other")

    @staticmethod
    def _risk_severity(score: int) -> str:
        if score >= 70:
            return "critical"
        elif score >= 50:
            return "high"
        elif score >= 30:
            return "medium"
        return "low"

    @staticmethod
    def _churn_level(churn: int) -> str:
        if churn >= 1000:
            return "high"
        elif churn >= 500:
            return "moderate"
        return "low"