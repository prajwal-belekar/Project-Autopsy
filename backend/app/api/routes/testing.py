from fastapi import APIRouter, HTTPException
from app.schemas.analysis import TestingData
from app.services.testing_service import TestingService

router = APIRouter()
testing_service = TestingService()


@router.get("/repositories/{repository_id}/testing", response_model=TestingData)
async def get_testing_health(repository_id: str):
    testing = await testing_service.get_testing_health(repository_id)
    if not testing:
        raise HTTPException(status_code=404, detail="Repository not found")
    return testing