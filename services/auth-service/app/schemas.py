from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    # Optional extras for user profile:
    locale: Optional[str] = None
    timezone: Optional[str] = None
    marketing_consent: bool = False

    class Config:
        schema_extra = {
            "example": {
                "email": "jane.doe@example.com",
                "password": "strongPassword123",
                "first_name": "Jane",
                "locale": "en-US",
                "timezone": "America/New_York",
                "marketing_consent": True
            }
        }

class UserRead(BaseModel):
    id: int
    email: EmailStr
    first_name: Optional[str] = None
    role: str
    is_active: bool
    is_email_verified: bool
    locale: Optional[str] = None
    timezone: Optional[str] = None
    profile_picture_url: Optional[str] = None
    marketing_consent: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        orm_mode = True

# ────────────────────────────────────────────────────────────────────────────────

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
