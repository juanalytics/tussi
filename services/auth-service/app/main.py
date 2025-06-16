from fastapi import FastAPI
from app.controllers import auth
from app.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tussi Auth Service",
    description="🔐 **Authentication microservice**\n\nRegister, login, and fetch your own profile.",
    version="0.1.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    openapi_tags=[
        {"name": "auth", "description": "💼 User registration & login endpoints"},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for testing only
    allow_credentials=True,
    allow_methods=["*"],  # ← THIS is critical to allow OPTIONS
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])


@app.get("/health", summary="Health Check", description="Health check for the Auth Service")
def health_check_root():
    return {"status": "ok", "message": "Auth service alive"}
    
#cors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", summary="Root Endpoint", description="Health check for the Auth Service")
def root():
    return {"message": "Auth service alive"}
