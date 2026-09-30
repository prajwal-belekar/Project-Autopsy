from fastapi import APIRouter, HTTPException
from app.schemas.analysis import IssuesData, PullRequestsData
from app.services.repository_service import RepositoryService

router = APIRouter()
repository_service = RepositoryService()


@router.get("/repositories/{repository_id}/issues", response_model=IssuesData)
async def get_issues(repository_id: str):
    issues = await repository_service.get_issues(repository_id)
    if not issues:
        raise HTTPException(status_code=404, detail="Repository not found")
    return issues


@router.get("/repositories/{repository_id}/pulls", response_model=PullRequestsData)
async def get_pull_requests(repository_id: str):
    pulls = await repository_service.get_pulls(repository_id)
    if not pulls:
        raise HTTPException(status_code=404, detail="Repository not found")
    return pulls