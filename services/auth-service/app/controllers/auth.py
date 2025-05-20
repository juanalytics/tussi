from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
from jose import jwt, JWTError

from app import schemas, deps, models
from app.services import auth_service as services

router = APIRouter(
    tags=["auth"],
    responses={404: {"description": "Not found"}}
)

# ─── JWT CONFIG ─────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET", "CHANGE_ME")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRATION", "30"))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ─── Register ───────────────────────────────────────────────────────────────────
@router.post(
    "/register",
    response_model=schemas.UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="""
Create a new user account.

- **email**: Unique user email address.  
- **password**: Strong password (min. 8 characters).  
- **first_name**: User's given name.  
- **locale**: Optional locale code (e.g., `en-US`).  
- **timezone**: Optional IANA timezone (e.g., `America/New_York`).  
- **marketing_consent**: Opt-in for marketing emails.
    """,
    responses={
        201: {"description": "User successfully registered"},
        409: {"description": "Email already registered"}
    },
)
def register(
    user_in: schemas.UserCreate,
    db: Session = Depends(deps.get_db),
):
    # 1) Check for existing email
    if services.get_user_by_email(db, user_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # 2) Pass last_name through to the service
    return services.create_user(
        db=db,
        email=user_in.email,
        password=user_in.password,
        first_name=user_in.first_name,
        last_name=user_in.last_name,               # ← new
        locale=user_in.locale,
        timezone=user_in.timezone,
        marketing_consent=user_in.marketing_consent
    )


# ─── Login (OAuth2 form) ─────────────────────────────────────────────────────────
@router.post(
    "/login",
    response_model=schemas.Token,
    summary="Authenticate user and issue JWT",
    description="""
Authenticate with **form data** (username & password) and receive a JSON Web Token.

Use the returned token in the `Authorization` header as:

    """,
    responses={
        200: {"description": "JWT token returned"},
        401: {"description": "Invalid username or password"}
    },
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db),
):
    user = services.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode(
        {"sub": str(user.id), "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {"access_token": token, "token_type": "bearer"}


# ─── Dependency to get current user ─────────────────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(deps.get_db),
):
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    user = db.query(models.user.User).filter(models.user.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exc
    return user


# ─── Get Current User ────────────────────────────────────────────────────────────
@router.get(
    "/me",
    response_model=schemas.UserRead,
    summary="Get current user profile",
    description="Return the user’s profile data for the authenticated user.",
    responses={
        200: {"description": "User profile returned"},
        401: {"description": "Not authenticated or token invalid"}
    },
)
def read_current_user(
    current_user: models.user.User = Depends(get_current_user),
):
    """
    Retrieves the profile of the currently authenticated user.

    - **Requires**: `Authorization: Bearer <token>` header.
    """
    return current_user
