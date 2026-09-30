import asyncio
import pytest
from app.services.repository_service import RepositoryService

@pytest.mark.asyncio
async def test_repository_service():
    svc = RepositoryService()
    repo_id = await svc.create_repository('test-repo', 'https://github.com/test/repo')
    assert repo_id is not None
    
    repo = await svc.get_repository(repo_id)
    assert repo["name"] == "test-repo"
    
    health = await svc.get_health_metrics(repo_id)
    assert health["overall"] == 73
    
    analysis = await svc.get_repository_analysis(repo_id)
    assert analysis["evidence_based_analysis"] is True
    assert analysis["confidence_level"] == 0.82