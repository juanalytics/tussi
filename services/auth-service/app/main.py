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

app.include_router(auth.router, prefix="/auth", tags=["auth"])

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
