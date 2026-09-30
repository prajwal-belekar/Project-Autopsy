from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import HttpUrl
from app.schemas.analysis import (
    AnalysisJobCreate,
    AnalysisJobResponse,
    AnalysisJobStatus,
    AnalyzeResult,
)
from app.services.repository_service import RepositoryService
from app.services.analysis_service import AnalysisService
import uuid

router = APIRouter()

repository_service = RepositoryService()
analysis_service = AnalysisService()


@router.post("/analysis", response_model=AnalysisJobResponse)
async def analyzeRepository(url: AnalysisJobCreate, background_tasks: BackgroundTasks):
    repository_url = str(url.repository_url)
    
    if "github.com" not in repository_url.lower():
        raise HTTPException(status_code=400, detail="Only GitHub repositories are supported")
    
    if "/private" in repository_url.lower():
        raise HTTPException(status_code=400, detail="Private repositories require authentication")
    
    analysis_id = str(uuid.uuid4())
    
    await analysis_service.create_analysis_job(analysis_id, repository_url)
    
    background_tasks.add_task(analysis_service.run_analysis, analysis_id)
    
    return {"analysis_id": analysis_id, "status": "queued"}


@router.get("/analysis/{analysisId}", response_model=AnalysisJobStatus)
async def getAnalysisStatus(analysisId: str):
    job = await analysis_service.get_analysis_job(analysisId)
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")
    return job