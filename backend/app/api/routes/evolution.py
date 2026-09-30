from fastapi import APIRouter, HTTPException
from app.schemas.analysis import EvolutionData
from app.services.evolution_service import EvolutionService

router = APIRouter()
evolution_service = EvolutionService()


@router.get("/repositories/{repository_id}/evolution", response_model=EvolutionData)
async def get_evolution(repository_id: str):
    evolution = await evolution_service.get_evolution(repository_id)
    if not evolution:
        raise HTTPException(status_code=404, detail="Repository not found")
    return evolution