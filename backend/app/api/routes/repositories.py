from fastapi import APIRouter, HTTPException
from app.schemas.analysis import Repository
from app.services.repository_service import RepositoryService

router = APIRouter()
repository_service = RepositoryService()


@router.get("/repositories/{repository_id}", response_model=Repository)
async def get_repository(repository_id: str):
    repo = await repository_service.get_repository(repository_id)
    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")
    return repo