from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

class AlertBase(BaseModel):
    alert_id: str
    source: str
    device: str
    severity: str
    alert_type: str
    timestamp: datetime
    summary: str
    details: Optional[Dict[str, Any]] = None
    raw_payload: Optional[Dict[str, Any]] = None
    idempotency_key: Optional[str] = None

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    created_at: datetime
    received_at: datetime

    class Config:
        from_attributes = True

class WebhookResponse(BaseModel):
    status: str
    alert_id: str

class ErrorResponse(BaseModel):
    detail: str

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class AlertQuery(BaseModel):
    page: int = 1
    page_size: int = 50
    severity: Optional[str] = None
    alert_type: Optional[str] = None
    device: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    q: Optional[str] = None

class MetricsResponse(BaseModel):
    total_alerts: int
    severity_counts: Dict[str, int]
    last_24h_count: int