from typing import Dict, Any, List, Optional
from app.services.repository_service import RepositoryService


class DebtService:
    def __init__(self):
        self.repository_service = RepositoryService()

    async def get_debt(self, repository_id: str) -> Dict[str, Any]:
        """Get technical debt analysis derived from actual repository source files."""
        repo_data = await self.repository_service.get_repository(repository_id)
        if not repo_data:
            return {
                "counts": {"todo": 0, "fixme": 0, "hack": 0, "largeFunctions": 0, "duplication": 0, "deprecated": 0},
                "register": [],
                "note": "No repository data available.",
            }

        files = repo_data.get("files", [])
        if not files:
            return {
                "counts": {"todo": 0, "fixme": 0, "hack": 0, "largeFunctions": 0, "duplication": 0, "deprecated": 0},
                "register": [],
                "note": "No source files available for debt analysis.",
            }

        # Compute debt counts from file debt_count fields
        total_todo = 0
        total_fixme = 0
        total_hack = 0
        total_large_functions = 0
        total_duplication = 0
        total_deprecated = 0
        register: List[Dict[str, Any]] = []

        for f in files:
            debt_count = f.get("debt_count", 0)
            if debt_count > 0:
                total_todo += debt_count  # simplified: count all as TODO for now
                register.append(
                    {
                        "id": f"debt-{f.get('path', 'unknown')}",
                        "location": f.get("path", "unknown"),
                        "line": 0,  # would need precise line from analyzer
                        "type": "TODO",
                        "severity": "low" if debt_count < 3 else "medium" if debt_count < 10 else "high",
                        "ageDays": 0,
                        "description": f"{debt_count} debt marker(s) in {f.get('path', 'unknown')}",
                    }
                )

        # Summary counts (simplified mapping)
        # In a full implementation, we'd parse the actual debt marker types from the analyzer
        counts = {
            "todo": total_todo,
            "fixme": total_fixme,
            "hack": total_hack,
            "largeFunctions": total_large_functions,
            "duplication": total_duplication,
            "deprecated": total_deprecated,
        }

        return {
            "counts": counts,
            "register": register[:20],  # top 20 for brevity
            "note": f"Technical debt analysis: {sum(counts.values())} total markers across {len([f for f in files if f.get('debt_count', 0) > 0])} file(s).",
        }