import sys
import os
import pytest
from fastapi.testclient import TestClient

# Adjust Python Path to import from app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from app.config import settings

client = TestClient(app)

def test_read_root():
    """
    Test the root API endpoint for online status indicator.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "database" in data
    assert data["local_inference"] is False

def test_auth_me_dev_bypass():
    """
    Test that requesting /api/auth/me in development mode without a token
    gracefully bypasses verification and returns the seed 'knowdev_dev' user.
    """
    # Force development mode for testing bypass behavior
    original_mode = settings.ENV_MODE
    settings.ENV_MODE = "development"
    try:
        response = client.get("/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "knowdev_dev"
        assert data["email"] == "dev@knowdev.ai"
    finally:
        settings.ENV_MODE = original_mode

def test_auth_me_unauthorized_prod():
    """
    Test that requesting /api/auth/me in production mode without a token
    properly blocks access returning 401 Unauthorized.
    """
    original_mode = settings.ENV_MODE
    settings.ENV_MODE = "production"
    try:
        response = client.get("/api/auth/me")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
    finally:
        settings.ENV_MODE = original_mode

def test_generate_commit_message():
    response = client.post("/api/code/commit-message", json={"diff": "diff --git a/app.py b/app.py"})
    assert response.status_code == 200
    data = response.json()
    assert "commit_message" in data

def test_generate_sprint_plan():
    response = client.post("/api/code/sprint-plan", json={"repo_name": "test-repo", "goals": "Add JWT auth"})
    assert response.status_code == 200
    data = response.json()
    assert data["repository"] == "test-repo"
    assert "tasks" in data
    assert len(data["tasks"]) > 0

def test_scan_dependencies():
    response = client.post("/api/code/scan-dependencies", json={"requirements_txt": "django==3.2.0\nrequests==2.25.1", "package_json": ""})
    assert response.status_code == 200
    data = response.json()
    assert "vulnerabilities" in data
    assert len(data["vulnerabilities"]) >= 2

def test_generate_architecture():
    response = client.post("/api/code/architecture", json={"repo_name": "test-repo"})
    assert response.status_code == 200
    data = response.json()
    assert "diagram" in data
    assert "graph TD" in data["diagram"]

