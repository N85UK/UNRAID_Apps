from sqlalchemy import Column, Integer, String, DateTime, Text, Index, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(255), index=True)  # Removed unique constraint for generic webhooks
    webhook_source = Column(String(100), index=True, default="ucgmax")  # Track webhook origin
    source = Column(String(255), index=True, nullable=True)
    device = Column(String(255), index=True, nullable=True)
    severity = Column(String(50), index=True, nullable=True)
    alert_type = Column(String(100), index=True, nullable=True)  # renamed from 'type' to avoid keyword
    timestamp = Column(DateTime(timezone=True), index=True)
    summary = Column(Text, nullable=True)
    details = Column(JSON, nullable=True)
    raw_payload = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    received_at = Column(DateTime(timezone=True), server_default=func.now())
    idempotency_key = Column(String(255), index=True, nullable=True)

# Indexes (without PostgreSQL-specific GIN indexes for cross-database compatibility)
Index('idx_alerts_timestamp', Alert.timestamp)
Index('idx_alerts_severity', Alert.severity)
Index('idx_alerts_type', Alert.alert_type)
Index('idx_alerts_device', Alert.device)
Index('idx_alerts_webhook_source', Alert.webhook_source)