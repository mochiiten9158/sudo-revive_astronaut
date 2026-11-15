from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    astronaut_id: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AstronautResponse(BaseModel):
    astronaut_id: str
    display_name: str
    mission_id: int | None = None