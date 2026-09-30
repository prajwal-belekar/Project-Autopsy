class TestingService:
    async def get_testing_health(self, repository_id: str):
        return {
            "testFiles": 5,
            "sourceFiles": 95,
            "ratioPct": 5,
            "suites": [],
            "activity": [],
            "riskAreas": [],
            "note": "..."
        }