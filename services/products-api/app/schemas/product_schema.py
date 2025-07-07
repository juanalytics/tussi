from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None

# This is the READ model, coming from Mongo
class Product(ProductBase):
    id: str

    class Config:
        orm_mode = True

# --- Event Sourcing Schemas ---

class ProductEventBase(BaseModel):
    product_id: str
    event_type: str
    event_data: Dict[str, Any]

class ProductEventCreate(ProductEventBase):
    pass

class ProductEvent(ProductEventBase):
    id: uuid.UUID
    created_at: datetime

    class Config:
        orm_mode = True 