from fastapi import APIRouter, HTTPException
from app.schemas.analysis import FileDetails
from app.services.code_analysis_service import CodeAnalysisService

router = APIRouter()
code_analysis_service = CodeAnalysisService()


@router.get("/repositories/{repository_id}/files/{file_path:path}", response_model=FileDetails)
async def get_file_details(repository_id: str, file_path: str):
    details = await code_analysis_service.get_file_details(repository_id, file_path)
    if not details:
        raise HTTPException(status_code=404, detail="File not found")
    return details