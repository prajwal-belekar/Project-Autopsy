import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get('/api/health')
    print(f'Health: {response.status_code} {response.json()}')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'

def test_create_analysis():
    response = client.post('/api/analysis', json={'repository_url': 'https://github.com/test/repo'})
    print(f'Analysis create: {response.status_code} {response.json()}')
    assert response.status_code == 200
    analysis_id = response.json()['analysis_id']
    return analysis_id

def test_get_analysis():
    analysis_id = test_create_analysis()
    response = client.get(f'/api/analysis/{analysis_id}')
    print(f'Analysis status: {response.status_code} {response.json()}')
    assert response.status_code == 200
    assert response.json()['id'] == analysis_id

def test_invalid_url():
    response = client.post('/api/analysis', json={'repository_url': 'not-a-url'})
    print(f'Invalid URL: {response.status_code}')
    assert response.status_code == 422

if __name__ == '__main__':
    time.sleep(0.5)
    test_health()
    test_get_analysis()
    test_invalid_url()
    print('ALL API TESTS PASSED')