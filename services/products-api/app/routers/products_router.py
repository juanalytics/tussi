from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from app.schemas import product_schema
from app.services import products_service
from app.db.database import get_db
from app.messaging import RabbitMQ, get_rabbitmq
from app.db.read_db import get_read_db, ReadDB
from app.services import products_query_service

router = APIRouter(
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Not found"}},
)

@router.get("/health", summary="Health check endpoint")
def health_check():
    return {"status": "ok"}

@router.post("/", status_code=201)
def create_product_endpoint(
    product: product_schema.ProductCreate, 
    db: Session = Depends(get_db),
    mq: RabbitMQ = Depends(get_rabbitmq)
):
    product_id, event = products_service.create_product(db=db, product=product)
    event_pydantic = product_schema.ProductEvent.from_orm(event)
    mq.publish_event(event_pydantic.dict())
    return {"product_id": product_id, "message": "Product creation event has been issued."}

@router.put("/{product_id}", status_code=202)
def update_product_endpoint(
    product_id: str, 
    product: product_schema.ProductUpdate, 
    db: Session = Depends(get_db),
    mq: RabbitMQ = Depends(get_rabbitmq)
):
    event = products_service.update_product(db, product_id=product_id, product_update=product)
    if event is None:
        raise HTTPException(status_code=304, detail="No changes were made.")
    
    event_pydantic = product_schema.ProductEvent.from_orm(event)
    mq.publish_event(event_pydantic.dict())
    return {"message": "Product update event has been issued."}

@router.delete("/{product_id}", status_code=202)
def delete_product_endpoint(
    product_id: str, 
    db: Session = Depends(get_db),
    mq: RabbitMQ = Depends(get_rabbitmq)
):
    event = products_service.delete_product(db, product_id=product_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Product not found.")
        
    event_pydantic = product_schema.ProductEvent.from_orm(event)
    mq.publish_event(event_pydantic.dict())
    return {"message": "Product deletion event has been issued."}

@router.get("/", response_model=List[product_schema.Product])
def read_products_endpoint(
    skip: int = 0, 
    limit: int = 10, 
    db: ReadDB = Depends(get_read_db)
):
    products = products_query_service.get_products(db, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=product_schema.Product)
def read_product_endpoint(
    product_id: str, 
    db: ReadDB = Depends(get_read_db)
):
    db_product = products_query_service.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.post("/populate", summary="Populate database with sample product events", status_code=201)
def populate_database(
    db: Session = Depends(get_db),
    mq: RabbitMQ = Depends(get_rabbitmq)
):
    """
    Populates the database with sample product events for demonstration.
    """
    sample_products = [
        {"name": "Tussi Pink Elixir", "description": "A magical pink potion that brings joy.", "price": 25.99, "stock": 100},
        {"name": "Cosmic Dust Capsules", "description": "Shimmering dust from a distant galaxy.", "price": 45.50, "stock": 50},
        {"name": "Dream Weaver Tea", "description": "A calming tea blend woven from moonbeams.", "price": 18.00, "stock": 75},
        {"name": "Giggle Shroom Gummies", "description": "A tasty gummy that inspires laughter.", "price": 15.00, "stock": 200},
        {"name": "Aura Cleansing Spray", "description": "A mist to cleanse your energetic field.", "price": 22.00, "stock": 60},
    ]

    events_created_count = 0
    for prod_data in sample_products:
        product_create_schema = product_schema.ProductCreate(**prod_data)
        _, event = products_service.create_product(db=db, product=product_create_schema)
        
        event_pydantic = product_schema.ProductEvent.from_orm(event)
        mq.publish_event(event_pydantic.dict())
        events_created_count += 1

    return {"message": f"{events_created_count} sample product events were created and published successfully."} 