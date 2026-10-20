from typing import Dict, Any, List, Optional
from app.services.repository_service import RepositoryService


class DocumentationService:
    def __init__(self):
        self.repository_service = RepositoryService()

    async def get_documentation_health(self, repository_id: str) -> Dict[str, Any]:
        """Get documentation health derived from actual repository source files."""
        repo_data = await self.repository_service.get_repository(repository_id)
        if not repo_data:
            return {
                "items": [],
                "inlineStats": [],
                "note": "No repository data available.",
            }

        files = repo_data.get("files", [])
        if not files:
            return {
                "items": [],
                "inlineStats": [],
                "note": "No source files available for documentation analysis.",
            }

        # Documented status from file-level documented flag
        documented_items: List[Dict[str, Any]] = []
        documented_count = 0
        not_documented_count = 0

        for f in files:
            is_documented = f.get("documented", False)
            path = f.get("path", "unknown")
            if is_documented:
                documented_count += 1
                documented_items.append(
                    {
                        "name": path.split("/")[-1] if "/" in path else path,
                        "status": "documented",
                        "evidence": f"File has documentation markers",
                    }
                )
            else:
                not_documented_count += 1

        # Inline stats
        total_items = documented_count + not_documented_count
        inline_stats = [
            {"label": "Documented", "value": f"{documented_count}"},
            {"label": "Not Documented", "value": f"{not_documented_count}"},
        ]

        return {
            "items": documented_items[:10],  # top 10 for brevity
            "inlineStats": inline_stats,
            "note": f"Documentation health: {documented_count} documented, {not_documented_count} not documented out of {total_items} file(s).",
        }