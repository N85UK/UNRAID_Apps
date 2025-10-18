from typing import Optional
from fastapi import FastAPI, Request, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from sqlalchemy.orm import Session
from . import crud, models, schemas, auth
from .database import SessionLocal, engine
from .config import settings
import logging

logging.basicConfig(level=getattr(logging, settings.log_level.upper()))
logger = logging.getLogger(__name__)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="UCG Max Webhook Receiver", version="1.0.0")

# Custom rate limit exception handler that handles both RateLimitExceeded and ValueError
def rate_limit_handler(request: Request, exc: Exception) -> JSONResponse:
    if hasattr(exc, 'detail'):
        message = f"Rate limit exceeded: {exc.detail}"
    else:
        message = f"Rate limit exceeded: {str(exc)}"
    return JSONResponse(
        status_code=429,
        content={"error": message}
    )

# Initialize limiter with a valid rate limit string
limiter = Limiter(
    key_func=get_remote_address, 
    default_limits=[f"{settings.rate_limit_requests}/{settings.rate_limit_window}second"]
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.add_exception_handler(ValueError, rate_limit_handler)  # Handle ValueError from rate limiting
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/webhook/ucgmax", response_model=schemas.WebhookResponse)
@limiter.limit(f"{settings.rate_limit_requests} per {settings.rate_limit_window} second")
async def receive_alert(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    headers = dict(request.headers)
    if not auth.verify_hmac_or_bearer(body, headers):
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        data = await request.json()
        alert_data = schemas.AlertCreate(**data)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid JSON or missing fields")

    # Check idempotency
    idempotency_key = headers.get('idempotency-key')
    if idempotency_key:
        existing = db.query(models.Alert).filter(models.Alert.idempotency_key == idempotency_key).first()
        if existing:
            raise HTTPException(status_code=409, detail="Duplicate alert")

    alert_data.idempotency_key = idempotency_key
    alert = crud.create_alert(db, alert_data)
    logger.info(f"Alert received: {alert.alert_id}")
    return {"status": "accepted", "alert_id": alert.alert_id}

# API routes
@app.get("/api/alerts")
async def get_alerts(
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    device: Optional[str] = None,
    start: Optional[str] = None,
    end: Optional[str] = None,
    q: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db)
):
    try:
        filters = {
            'severity': severity,
            'alert_type': alert_type,
            'device': device,
            'start': start,
            'end': end,
            'q': q
        }
        skip = (page - 1) * page_size
        alerts = crud.get_alerts(db, skip=skip, limit=page_size, filters=filters)
        return alerts
    except Exception as e:
        logger.error(f"Error fetching alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching alerts: {str(e)}")

@app.get("/api/alerts/{alert_id}", response_model=schemas.Alert)
def get_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = crud.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@app.delete("/api/alerts/{alert_id}")
def delete_alert(alert_id: int, current_user: str = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    crud.delete_alert(db, alert_id)
    return {"status": "deleted"}

@app.get("/api/metrics", response_model=schemas.MetricsResponse)
def get_metrics(db: Session = Depends(get_db)):
    try:
        return crud.get_metrics(db)
    except Exception as e:
        logger.error(f"Error fetching metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching metrics: {str(e)}")

@app.get("/api/alerts/export")
async def export_alerts(
    severity: Optional[str] = None,
    alert_type: Optional[str] = None,
    device: Optional[str] = None,
    start: Optional[str] = None,
    end: Optional[str] = None,
    db: Session = Depends(get_db)
):
    from fastapi.responses import StreamingResponse
    import csv
    import io
    
    filters = {
        'severity': severity,
        'alert_type': alert_type,
        'device': device,
        'start': start,
        'end': end
    }
    alerts = crud.get_alerts(db, skip=0, limit=10000, filters=filters)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID', 'Alert ID', 'Timestamp', 'Severity', 'Type', 'Device', 'Summary', 'Source'])
    
    for alert in alerts:
        writer.writerow([
            alert.id,
            alert.alert_id,
            alert.timestamp.isoformat(),
            alert.severity,
            alert.alert_type,
            alert.device,
            alert.summary,
            alert.source
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=ucgmax-alerts.csv"}
    )

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ucg-max-webhook-receiver"}

@app.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        db.execute("SELECT 1")
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database not ready: {str(e)}")

# Auth
@app.post("/auth/login", response_model=schemas.TokenResponse)
def login(request: schemas.LoginRequest):
    user = auth.authenticate_user(request.username, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Serve frontend
from fastapi.staticfiles import StaticFiles
# Try different paths for frontend (all-in-one uses ./static, standard uses ../frontend/dist)
import os
frontend_dir = "./static" if os.path.exists("./static") else "../frontend/dist"
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
else:
    print(f"Warning: Frontend directory not found at {frontend_dir}")