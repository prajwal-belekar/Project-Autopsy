from fastapi import APIRouter, HTTPException
from app.schemas.analysis import GitForensicsData
from app.services.git_analysis_service import GitAnalysisService

router = APIRouter()
git_analysis_service = GitAnalysisService()


@router.get("/repositories/{repository_id}/git", response_model=GitForensicsData)
async def get_git_forensics(repository_id: str):
    git = await git_analysis_service.get_git_forensics(repository_id)
    if not git:
        raise HTTPException(status_code=404, detail="Repository not found")
    return git