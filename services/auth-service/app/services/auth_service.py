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

def create_user(db: Session, email: str, password: str):
    hashed = hash_password(password)
    new_user = user_model.User(email=email, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
