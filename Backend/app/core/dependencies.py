from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from jwt.exceptions import InvalidTokenError

from app.db.database import get_db
from app.db.models import User, Astronaut
from app.core.security import decode_access_token

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload.get("sub"))
    except (InvalidTokenError, TypeError, ValueError):
        raise unauthorized

    user = db.query(User).filter(User.id == user_id).first()

    if user is None or not user.is_active or user.role != "astronaut":
        raise unauthorized

    return user


def get_current_astronaut(
    current_user: User = Depends(get_current_user),
) -> Astronaut:
    if current_user.astronaut_profile is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No astronaut profile is linked to this account.",
        )

    return current_user.astronaut_profile