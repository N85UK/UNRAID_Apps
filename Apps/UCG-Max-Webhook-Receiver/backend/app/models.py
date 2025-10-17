from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True)
    source = Column(String, index=True)
    device = Column(String, index=True)
    severity = Column(String, index=True)
    alert_type = Column(String, index=True)  # renamed from 'type' to avoid keyword
    timestamp = Column(DateTime(timezone=True), index=True)
    summary = Column(Text)
    details = Column(JSON)
    raw_payload = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    received_at = Column(DateTime(timezone=True), server_default=func.now())
    idempotency_key = Column(String, index=True)

# Indexes
Index('idx_alerts_timestamp', Alert.timestamp)
Index('idx_alerts_severity', Alert.severity)
Index('idx_alerts_type', Alert.alert_type)
Index('idx_alerts_device', Alert.device)
Index('idx_alerts_details_gin', Alert.details, postgresql_using='gin')
Index('idx_alerts_raw_payload_gin', Alert.raw_payload, postgresql_using='gin')