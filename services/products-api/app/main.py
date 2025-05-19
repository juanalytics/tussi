from fastapi import FastAPI
from app.db.database import engine, Base
from app.routers import products_router
from app.models import product 

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Products API",
    description="API for managing products",
    version="0.1.0"
)

app.include_router(products_router.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Products API"} 