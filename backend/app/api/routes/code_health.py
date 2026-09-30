from fastapi import APIRouter, HTTPException
from app.schemas.analysis import CodeHealthData
from app.services.code_analysis_service import CodeAnalysisService

router = APIRouter()
code_analysis_service = CodeAnalysisService()


@router.get("/repositories/{repository_id}/health", response_model=CodeHealthData)
async def get_code_health(repository_id: str):
    health = await code_analysis_service.get_code_health(repository_id)
    if not health:
        raise HTTPException(status_code=404, detail="Repository not found")
    return health