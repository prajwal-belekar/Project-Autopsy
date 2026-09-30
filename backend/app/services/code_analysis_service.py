class CodeAnalysisService:
    async def get_code_health(self, repository_id: str):
        return {
            "metrics": [{"label": "Complexity", "score": 70, "severity": "medium", "hint": "..."}],
            "complexityDistribution": [],
            "largestFiles": [],
            "largestFunctions": [],
            "coupling": []
        }

    async def get_file_details(self, repository_id: str, file_path: str):
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
            "debt": []
        }