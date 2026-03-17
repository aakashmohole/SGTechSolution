from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# Shared properties for an individual order item
class OrderItemBase(BaseModel):
    part_id: int
    quantity: int
    price_at_time: float

# Properties to receive on item creation
class OrderItemCreate(OrderItemBase):
    pass

# Properties of item returning from DB
class OrderItemInDB(OrderItemBase):
    id: int
    order_id: int

    class Config:
        from_attributes = True

# Shared properties for an order
class OrderBase(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    delivery_address: str

# Properties to receive on order creation
class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

# Properties to return from DB
class OrderResponse(OrderBase):
    id: int
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemInDB]

    class Config:
        from_attributes = True

# Properties to update an order
class OrderUpdate(BaseModel):
    status: str
