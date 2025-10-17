from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://user:password@localhost/dbname"
    secret_key: str = "your-secret-key"
    hmac_secret: str = "shared-hmac-secret"
    bearer_token: str = "bearer-token"
    admin_user: str = "admin"
    admin_password: str = "changeme"
    alert_retention_days: int = 30
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds
    log_level: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()