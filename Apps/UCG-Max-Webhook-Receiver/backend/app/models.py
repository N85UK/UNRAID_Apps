from sqlalchemy import Column, Integer, String, DateTime, Text, Index, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(255), unique=True, index=True)
    source = Column(String(255), index=True)
    device = Column(String(255), index=True)
    severity = Column(String(50), index=True)
    alert_type = Column(String(100), index=True)  # renamed from 'type' to avoid keyword
    timestamp = Column(DateTime(timezone=True), index=True)
    summary = Column(Text)
    details = Column(JSON)
    raw_payload = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    received_at = Column(DateTime(timezone=True), server_default=func.now())
    idempotency_key = Column(String(255), index=True)

# Indexes (without PostgreSQL-specific GIN indexes for cross-database compatibility)
Index('idx_alerts_timestamp', Alert.timestamp)
Index('idx_alerts_severity', Alert.severity)
Index('idx_alerts_type', Alert.alert_type)
Index('idx_alerts_device', Alert.device)