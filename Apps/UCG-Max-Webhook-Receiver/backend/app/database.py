from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# Create engine with connection pool settings to prevent "MySQL server has gone away"
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,  # Test connections before using them
    pool_recycle=3600,   # Recycle connections after 1 hour
    pool_size=5,         # Number of connections to maintain
    max_overflow=10,     # Allow up to 10 additional connections
    echo=False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()