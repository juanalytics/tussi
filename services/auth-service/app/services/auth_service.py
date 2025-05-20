from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models import user as user_model

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_user_by_email(db: Session, email: str):
    return db.query(user_model.User).filter(user_model.User.email == email).first()

def authenticate_user(db: Session, email: str, password: str):
    user_obj = get_user_by_email(db, email)
    if not user_obj or not verify_password(password, user_obj.hashed_password):
        return None
    return user_obj

def create_user(
    db: Session,
    *,
    email: str,
    password: str,
    first_name: str,
    last_name: Optional[str] = None,
    locale: Optional[str] = None,
    timezone: Optional[str] = None,
    marketing_consent: bool = False
) -> user_model.User:
    # 1) Hash the incoming password
    hashed = hash_password(password)

    # 2) Create the User model instance with all fields
    new_user = user_model.User(
        email=email,
        hashed_password=hashed,
        first_name=first_name,
        last_name=last_name,
        locale=locale,
        timezone=timezone,
        marketing_consent=marketing_consent
    )

    # 3) Persist to DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
