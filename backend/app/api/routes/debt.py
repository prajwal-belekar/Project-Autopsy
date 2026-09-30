from fastapi import APIRouter, HTTPException
from app.schemas.analysis import DebtData
from app.services.debt_service import DebtService

router = APIRouter()
debt_service = DebtService()


@router.get("/repositories/{repository_id}/debt", response_model=DebtData)
async def get_technical_debt(repository_id: str):
    debt = await debt_service.get_debt(repository_id)
    if not debt:
        raise HTTPException(status_code=404, detail="Repository not found")
    return debt