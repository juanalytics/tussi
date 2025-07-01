from fastapi import FastAPI
from app.db.database import engine, Base
from app.routers import products_router
from app.models import product 
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Products API",
    description="API for managing products",
    version="0.1.0"
)

app.include_router(products_router.router)

#cors 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Products API"} 

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "products-api",
        "timestamp": datetime.now().isoformat()
    } 