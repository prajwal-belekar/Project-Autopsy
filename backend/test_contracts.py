from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
REPO_ID = "demo-repository"


def check_contract(path, required_keys):
    response = client.get(path)
    assert response.status_code == 200, f"{path}: {response.status_code} {response.text}"
    data = response.json()
    if isinstance(data, list):
        assert len(data) > 0
        for item in data:
            for key in required_keys:
                assert key in item, f"missing {key} in {path}"
    else:
        for key in required_keys:
            assert key in data, f"missing {key} in {path}"
    print(f"OK {path}")


if __name__ == "__main__":
    check_contract("/api/health", ["status", "service"])

    # Friction keeps frontend contract and adds transparency
    check_contract(f"/api/repositories/{REPO_ID}/friction",
                   ["score", "level", "description", "factors", "weights", "note"])
    friction = client.get(f"/api/repositories/{REPO_ID}/friction").json()
    assert "contributions" in friction
    assert "category_contributions" in friction
    assert friction["score"] > 0
    print("friction contributions:", friction["contributions"])

    # Hotspots keep frontend contract
    check_contract(f"/api/repositories/{REPO_ID}/hotspots",
                   ["path", "complexity", "revisions", "bugFixes", "risk", "riskSeverity"])
    hotspots = client.get(f"/api/repositories/{REPO_ID}/hotspots").json()
    assert hotspots[0]["signals"], "hotspot must expose signal breakdown"

    # Findings keep frontend contract and add confidence
    check_contract(f"/api/repositories/{REPO_ID}/findings",
                   ["id", "title", "severity", "observation", "evidence", "impact", "recommendation"])
    findings = client.get(f"/api/repositories/{REPO_ID}/findings").json()
    for f in findings:
        assert f["evidence"], "evidence must not be empty"
        assert f["evidenceLink"]["to"], "evidence link must point at a file"
    assert set(findings[0].keys()) == {"id", "title", "area", "severity", "observation",
                                       "evidence", "impact", "recommendation",
                                       "evidenceLink", "aiInterpretation"}, (
        f"findings payload must match frontend contract, got {sorted(findings[0].keys())}"
    )

    # Recommendation endpoint
    check_contract(f"/api/repositories/{REPO_ID}/recommendations",
                   ["id", "priority", "issue", "evidence", "action", "benefit"])

    # Evolution endpoint keeps contract and adds time analysis
    check_contract(f"/api/repositories/{REPO_ID}/evolution", ["events", "note"])
    evolution = client.get(f"/api/repositories/{REPO_ID}/evolution").json()
    assert "time_analysis" in evolution

    # Primary finding
    pf = client.get(f"/api/repositories/{REPO_ID}/primary-finding")
    print("primary-finding status:", pf.status_code)

    print("ALL CONTRACT TESTS PASSED")