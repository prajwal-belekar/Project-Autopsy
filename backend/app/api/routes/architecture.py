from fastapi import APIRouter, HTTPException
from app.schemas.analysis import ArchitectureData
from app.services.architecture_service import ArchitectureService

router = APIRouter()
architecture_service = ArchitectureService()


@router.get("/repositories/{repository_id}/architecture", response_model=ArchitectureData)
async def get_architecture(repository_id: str):
    architecture = await architecture_service.get_architecture(repository_id)
    if not architecture:
        raise HTTPException(status_code=404, detail="Repository not found")
    return architecture