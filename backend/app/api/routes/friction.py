from fastapi import APIRouter, HTTPException
from app.schemas.analysis import FrictionData
from app.services.friction_service import FrictionService

router = APIRouter()
friction_service = FrictionService()


@router.get("/repositories/{repository_id}/friction", response_model=FrictionData)
async def get_development_friction(repository_id: str):
    friction = await friction_service.get_friction(repository_id)
    if not friction:
        raise HTTPException(status_code=404, detail="Repository not found")
    return friction