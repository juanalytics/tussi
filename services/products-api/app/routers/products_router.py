from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.schemas import product_schema
from app.services import products_service
from app.db.database import get_db

router = APIRouter(
    prefix="/products",
    tags=["products"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=product_schema.Product)
def create_product_endpoint(product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    return products_service.create_product(db=db, product=product)

@router.get("/", response_model=List[product_schema.Product])
def read_products_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = products_service.get_products(db, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=product_schema.Product)
def read_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    db_product = products_service.get_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=product_schema.Product)
def update_product_endpoint(product_id: int, product: product_schema.ProductUpdate, db: Session = Depends(get_db)):
    db_product = products_service.update_product(db, product_id=product_id, product_update=product)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.delete("/{product_id}", response_model=product_schema.Product)
def delete_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    db_product = products_service.delete_product(db, product_id=product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product 