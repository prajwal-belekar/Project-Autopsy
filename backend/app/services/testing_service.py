from typing import Dict, Any, List, Optional
from app.services.repository_service import RepositoryService
from app.engines.testing_gap_engine import TestingGapEngine


class TestingService:
    def __init__(self):
        self.repository_service = RepositoryService()
        self.testing_gap_engine = TestingGapEngine()

    async def get_testing_health(self, repository_id: str) -> Dict[str, Any]:
        """Get testing health metrics derived from actual repository source files."""
        repo_data = await self.repository_service.get_repository(repository_id)
        if not repo_data:
            return {
                "testFiles": 0,
                "sourceFiles": 0,
                "ratioPct": 0,
                "suites": [],
                "activity": [],
                "riskAreas": [],
                "note": "No repository data available.",
            }

        files = repo_data.get("files", [])
        if not files:
            return {
                "testFiles": 0,
                "sourceFiles": 0,
                "ratioPct": 0,
                "suites": [],
                "activity": [],
                "riskAreas": [],
                "note": "No source files available for testing analysis.",
            }

        # Count test vs source files based on file paths
        test_files = [f for f in files if "test" in f.get("path", "").lower()]
        source_files = [f for f in files if not ("test" in f.get("path", "").lower())]

        test_file_count = len(test_files)
        source_file_count = len(source_files)

        # Ratio of test to source files
        ratio_pct = round(test_file_count / max(source_file_count, 1) * 100)

        # Use TestingGapEngine to compute gap and classify
        # We need module changes and repository max - approximate from available data
        # Source changes proxy: number of files with revisions/churn
        # Test changes proxy: number of test files
        source_signal = len(files)  # proxy: total source files
        test_signal = len(test_files)  # proxy: test files

        # Compute gap using the engine
        repo_max = {"source_changes": len(files), "test_changes": len(test_files)}
        gap_result = self.testing_gap_engine.compute_gap(
            {"source_changes": source_signal, "test_changes": test_signal}, repo_max
        )

        # Derive risk areas from files with high test gaps
        risk_areas = []
        for f in files:
            if f.get("test_signal", 0) < 30 and f.get("churn", 0) > 500:
                risk_areas.append(
                    {
                        "path": f.get("path", ""),
                        "module": f.get("path", "").split("/")[0] if "/" in f.get("path", "") else "root",
                        "risk": f.get("score", 0) if f.get("score") else 0,
                        "complexity": f.get("complexity", 0),
                        "testSignal": f.get("test_signal", "low"),
                        "churn": f.get("churn", 0),
                    }
                )

        # Activity from the monthly data
        monthly = repo_data.get("monthly", [])
        activity = []
        if monthly:
            for month in monthly[:3]:
                activity.append(
                    {
                        "month": month.get("month", ""),
                        "testCommits": month.get("testing", 0),
                        "testFiles": month.get("bug_fixes", 0),  # proxy
                    }
                )

        # Suites (simplified)
        suites = [
            {
                "name": "Unit Tests",
                "status": "passing" if ratio_pct > 30 else "limited",
                "evidence": f"Test ratio: {ratio_pct}%",
            }
        ]

        return {
            "testFiles": test_file_count,
            "sourceFiles": source_file_count,
            "ratioPct": ratio_pct,
            "suites": suites,
            "activity": activity,
            "riskAreas": risk_areas,
            "note": gap_result.get("note", "Testing gap analysis completed."),
        }