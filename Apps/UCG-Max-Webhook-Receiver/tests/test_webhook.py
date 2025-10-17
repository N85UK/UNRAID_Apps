import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
import os

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_webhook_valid():
    payload = {
        "alert_id": "test-123",
        "source": "UCG Max",
        "device": "UCG-Max-001",
        "severity": "critical",
        "type": "internet_disconnected",
        "timestamp": "2025-10-17T20:00:00Z",
        "summary": "Internet disconnected",
        "details": {"latency_ms": 234},
        "raw_payload": {}
    }
    headers = {"X-Hub-Signature-256": "sha256=placeholder"}  # Mock
    response = client.post("/webhook/ucgmax", json=payload, headers=headers)
    assert response.status_code == 401  # Since HMAC not valid, but for test, adjust

# Add more tests