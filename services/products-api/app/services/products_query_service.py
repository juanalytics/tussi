from app.db.read_db import ReadDB
from typing import List, Optional
from app.schemas import product_schema

def get_products(db: ReadDB, skip: int = 0, limit: int = 10) -> List[product_schema.Product]:
    """
    Retrieves a list of products from the read database.
    """
    products_cursor = db.products.find().skip(skip).limit(limit)
    return [product_schema.Product(**p) for p in products_cursor]

def get_product(db: ReadDB, product_id: str) -> Optional[product_schema.Product]:
    """
    Retrieves a single product by its ID from the read database.
    """
    product_data = db.products.find_one({"id": product_id})
    if product_data:
        return product_schema.Product(**product_data)
    return None 