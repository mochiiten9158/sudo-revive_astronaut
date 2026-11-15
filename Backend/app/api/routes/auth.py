from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.security import (
    verify_password,
    create_access_token,
)
from app.core.dependencies import get_current_astronaut
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    AstronautResponse,
)

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/login", response_model=TokenResponse)
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db),
):
    astronaut_id = credentials.astronaut_id.strip()

    user = (
        db.query(User)
        .filter(User.username == astronaut_id)
        .first()
    )

    if (
        user is None
        or not user.is_active
        or user.role != "astronaut"
        or not verify_password(
            credentials.password,
            user.password_hash,
        )
        or user.astronaut_profile is None
        or user.astronaut_profile.astronaut_code != astronaut_id
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid astronaut ID or password.",
        )

    token = create_access_token(user.id)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
    )


@router.get("/me", response_model=AstronautResponse)
def get_my_profile(
    astronaut=Depends(get_current_astronaut),
):
    return AstronautResponse(
        astronaut_id=astronaut.astronaut_code,
        display_name=astronaut.display_name,
        mission_id=astronaut.mission_id,
    )