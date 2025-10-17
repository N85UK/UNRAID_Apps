from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, String, cast
from . import models, schemas
from datetime import datetime, timedelta

def create_alert(db: Session, alert: schemas.AlertCreate):
    db_alert = models.Alert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_alert(db: Session, alert_id: int):
    return db.query(models.Alert).filter(models.Alert.id == alert_id).first()

def get_alerts(db: Session, skip: int = 0, limit: int = 100, filters: dict = None):
    query = db.query(models.Alert)
    if filters:
        if filters.get('severity'):
            query = query.filter(models.Alert.severity == filters['severity'])
        if filters.get('alert_type'):
            query = query.filter(models.Alert.alert_type == filters['alert_type'])
        if filters.get('device'):
            query = query.filter(models.Alert.device == filters['device'])
        if filters.get('start'):
            query = query.filter(models.Alert.timestamp >= filters['start'])
        if filters.get('end'):
            query = query.filter(models.Alert.timestamp <= filters['end'])
        if filters.get('q'):
            q = filters['q']
            query = query.filter(
                or_(
                    models.Alert.summary.ilike(f'%{q}%'),
                    cast(models.Alert.details, String).ilike(f'%{q}%'),
                    cast(models.Alert.raw_payload, String).ilike(f'%{q}%')
                )
            )
    return query.offset(skip).limit(limit).all()

def delete_alert(db: Session, alert_id: int):
    db_alert = db.query(models.Alert).filter(models.Alert.id == alert_id).first()
    if db_alert:
        db.delete(db_alert)
        db.commit()
    return db_alert

def bulk_delete_alerts(db: Session, filters: dict):
    query = db.query(models.Alert)
    if filters:
        # Similar to get_alerts
        pass  # Implement similar filters
    query.delete()
    db.commit()

def get_metrics(db: Session):
    total = db.query(func.count(models.Alert.id)).scalar()
    severity_counts = db.query(models.Alert.severity, func.count(models.Alert.id)).group_by(models.Alert.severity).all()
    last_24h = db.query(func.count(models.Alert.id)).filter(models.Alert.received_at >= datetime.utcnow() - timedelta(hours=24)).scalar()
    return {
        "total_alerts": total,
        "severity_counts": dict(severity_counts),
        "last_24h_count": last_24h
    }

def cleanup_old_alerts(db: Session, days: int):
    cutoff = datetime.utcnow() - timedelta(days=days)
    db.query(models.Alert).filter(models.Alert.received_at < cutoff).delete()
    db.commit()