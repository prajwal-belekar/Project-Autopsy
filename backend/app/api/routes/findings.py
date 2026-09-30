from fastapi import APIRouter, HTTPException, Query
from app.schemas.analysis import Finding, Recommendation, PrimaryFinding
from app.services.findings_service import FindingsService

router = APIRouter()
findings_service = FindingsService()


@router.get("/repositories/{repository_id}/findings", response_model=list[Finding])
async def get_findings(
    repository_id: str,
    severity: str | None = Query(default=None),
    category: str | None = Query(default=None),
    file: str | None = Query(default=None),
):
    findings = await findings_service.get_findings(
        repository_id, severity=severity, category=category, file_path=file
    )
    if findings is None:
        raise HTTPException(status_code=404, detail="Repository not found")
    return findings


@router.get("/repositories/{repository_id}/recommendations", response_model=list[Recommendation])
async def get_recommendations(repository_id: str):
    recommendations = await findings_service.get_recommendations(repository_id)
    if recommendations is None:
        raise HTTPException(status_code=404, detail="Repository not found")
    return recommendations


@router.get("/repositories/{repository_id}/primary-finding", response_model=PrimaryFinding)
async def get_primary_finding(repository_id: str):
    finding = await findings_service.get_primary_finding(repository_id)
    if finding is None:
        raise HTTPException(status_code=404, detail="Repository not found")
    return finding