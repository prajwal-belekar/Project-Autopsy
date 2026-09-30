class ArchitectureService:
    async def get_architecture(self, repository_id: str):
        return {
            "sourceModules": 5,
            "dependencyEdges": 10,
            "graphModules": [],
            "circular": [],
            "highlyCoupled": [],
            "summary": "...",
            "inferenceNote": "..."
        }