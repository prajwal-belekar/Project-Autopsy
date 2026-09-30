from fastapi import APIRouter, HTTPException
from app.schemas.analysis import Hotspot
from app.services.hotspot_service import HotspotService

router = APIRouter()
hotspot_service = HotspotService()


@router.get("/repositories/{repository_id}/hotspots", response_model=list[Hotspot])
async def get_hotspots(repository_id: str):
    hotspots = await hotspot_service.get_hotspots(repository_id)
    if hotspots is None:
        raise HTTPException(status_code=404, detail="Repository not found")
    return hotspots