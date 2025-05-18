from sqlalchemy.orm import Session
from app.models import product as product_model
from app.schemas import product_schema
from typing import List, Optional

def get_product(db: Session, product_id: int) -> Optional[product_model.Product]:
    return db.query(product_model.Product).filter(product_model.Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[product_model.Product]:
    return db.query(product_model.Product).offset(skip).limit(limit).all()

def create_product(db: Session, product: product_schema.ProductCreate) -> product_model.Product:
    db_product = product_model.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_update: product_schema.ProductUpdate) -> Optional[product_model.Product]:
    db_product = get_product(db, product_id)
    if db_product:
        update_data = product_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        db.commit()
        db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int) -> Optional[product_model.Product]:
    db_product = get_product(db, product_id)
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product 