from fastapi import FastAPI
from app.db.database import engine
from app.routers import products_router
from app.models import product as event_model
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import threading
from app.projector import run_projector
from app.messaging import rabbitmq_client
from app.db.read_db import read_db_client

event_model.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Products API",
    description="API for managing products with CQRS and Event Sourcing",
    version="0.2.0"
)

@app.on_event("startup")
def startup_event():
    # Start the projector in a background thread
    projector_thread = threading.Thread(target=run_projector, daemon=True)
    projector_thread.start()
    rabbitmq_client.connect()

@app.on_event("shutdown")
def shutdown_event():
    rabbitmq_client.close()
    read_db_client.close()

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