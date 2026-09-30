class DebtService:
    async def get_debt(self, repository_id: str):
        return {
            "counts": {"todo": 0, "fixme": 0, "hack": 0, "largeFunctions": 0, "duplication": 0, "deprecated": 0},
            "register": [],
            "note": "..."
        }