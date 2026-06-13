from pydantic import BaseModel
from typing import Optional, List, Annotated
from decimal import Decimal
from datetime import datetime

class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    unit_price: Decimal

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    subtotal: Decimal
    
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    table_id: Optional[int] = None
    customer_id: Optional[int] = None
    status: str = "draft"
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    table_id: Optional[int] = None
    customer_id: Optional[int] = None
    status: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class OrderResponse(OrderBase):
    id: int
    order_number: str
    subtotal: Decimal
    tax: Decimal
    total: Decimal
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    table: Optional['TableResponse'] = None
    customer: Optional['CustomerResponse'] = None
    
    class Config:
        from_attributes = True

# Import to resolve forward references
from schemas.table import TableResponse
from schemas.customer import CustomerResponse