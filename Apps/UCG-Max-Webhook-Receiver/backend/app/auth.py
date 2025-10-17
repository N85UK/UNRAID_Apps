from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm="HS256")
    return encoded_jwt

def authenticate_user(username: str, password: str):
    if username == settings.admin_user and verify_password(password, get_password_hash(settings.admin_password)):
        return {"username": username}
    return False

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return username

def verify_hmac_or_bearer(request_body: bytes, headers: dict):
    auth_header = headers.get('authorization')
    if auth_header and auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        if token == settings.bearer_token:
            return True
    # HMAC
    signature = headers.get('x-hub-signature-256') or headers.get('x-hub-signature')
    if signature:
        import hmac
        import hashlib
        secret = settings.hmac_secret.encode()
        expected = hmac.new(secret, request_body, hashlib.sha256).hexdigest()
        if signature.startswith('sha256='):
            provided = signature.split('=')[1]
        else:
            provided = signature
        if hmac.compare_digest(expected, provided):
            return True
    return False