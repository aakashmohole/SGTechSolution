from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.order import Order, OrderItem
from app.models.part import Part
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate

router = APIRouter()

@router.post("/", response_model=OrderResponse)
def create_order(
    *,
    db: Session = Depends(get_db),
    order_in: OrderCreate
) -> Any:
    """
    Create a new order.
    """
    total_amount = 0.0
    items_to_create = []

    # Calculate total and validate stock
    for item in order_in.items:
        part = db.query(Part).filter(Part.id == item.part_id).first()
        if not part:
            raise HTTPException(status_code=404, detail=f"Part with ID {item.part_id} not found.")
        
        if part.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for part {part.name}. Available: {part.stock}")

        # Update stock
        part.stock -= item.quantity
        
        # We must use the item price_at_time for the total or recalculate from DB
        # To be safe, we calculate the total accurately utilizing price_at_time given by the schema
        line_total = item.quantity * item.price_at_time
        total_amount += line_total
        
        items_to_create.append(item)

    # Create Order
    new_order = Order(
        customer_name=order_in.customer_name,
        customer_email=order_in.customer_email,
        customer_phone=order_in.customer_phone,
        delivery_address=order_in.delivery_address,
        total_amount=total_amount,
        status="Pending"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Create OrderItems
    for item_in in items_to_create:
        new_item = OrderItem(
            order_id=new_order.id,
            part_id=item_in.part_id,
            quantity=item_in.quantity,
            price_at_time=item_in.price_at_time
        )
        db.add(new_item)

    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[OrderResponse])
def read_orders(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve orders.
    """
    orders = db.query(Order).offset(skip).limit(limit).all()
    return orders

@router.patch("/{order_id}", response_model=OrderResponse)
def update_order_status(
    *,
    db: Session = Depends(get_db),
    order_id: int,
    order_in: OrderUpdate
) -> Any:
    """
    Update the status of an order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = order_in.status
    db.commit()
    db.refresh(order)
    return order
