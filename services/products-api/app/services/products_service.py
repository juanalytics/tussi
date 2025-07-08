from sqlalchemy.orm import Session
from app.models import product as event_model
from app.schemas import product_schema
from typing import Optional
import uuid

def create_product(db: Session, product: product_schema.ProductCreate) -> (str, event_model.ProductEvent):
    product_id = str(uuid.uuid4())
    event_data = product.dict()
    
    event = event_model.ProductEvent(
        product_id=product_id,
        event_type="ProductCreated",
        event_data=event_data
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return product_id, event

def update_product(db: Session, product_id: str, product_update: product_schema.ProductUpdate) -> Optional[event_model.ProductEvent]:
    update_data = product_update.dict(exclude_unset=True)
    if not update_data:
        return None

    # In a real-world scenario, you would first validate if the product exists
    # by checking the event store for a "ProductCreated" event.
    
    event = event_model.ProductEvent(
        product_id=product_id,
        event_type="ProductUpdated",
        event_data=update_data
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

def delete_product(db: Session, product_id: str) -> Optional[event_model.ProductEvent]:
    # Similar to update, we just create a "deleted" event
    event = event_model.ProductEvent(
        product_id=product_id,
        event_type="ProductDeleted",
        event_data={} 
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event 