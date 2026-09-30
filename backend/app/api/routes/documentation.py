from fastapi import APIRouter, HTTPException
from app.schemas.analysis import DocumentationData
from app.services.documentation_service import DocumentationService

router = APIRouter()
documentation_service = DocumentationService()


@router.get("/repositories/{repository_id}/documentation", response_model=DocumentationData)
async def get_documentation_health(repository_id: str):
    doc = await documentation_service.get_documentation_health(repository_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Repository not found")
    return doc